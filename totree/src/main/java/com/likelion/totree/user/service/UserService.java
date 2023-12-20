package com.likelion.totree.user.service;

import com.likelion.totree.redis.CacheNames;
import com.likelion.totree.redis.RedisDao;
import com.likelion.totree.security.exception.AlreadyExistsError;
import com.likelion.totree.security.exception.DifferentDateError;
import com.likelion.totree.security.exception.NoTicketError;
import com.likelion.totree.security.jwt.JwtProvider;
import com.likelion.totree.user.dto.LoginRequest;
import com.likelion.totree.user.dto.PostResponse;
import com.likelion.totree.user.dto.SignUpRequest;
import com.likelion.totree.user.dto.UserResponse;
import com.likelion.totree.user.entity.Post;
import com.likelion.totree.user.entity.User;
import com.likelion.totree.user.entity.UserRoleEnum;
import com.likelion.totree.user.repository.PostRepository;
import com.likelion.totree.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;
    private final JwtProvider jwtProvider;
    private final RedisDao redisDao;



    @Transactional
    public ResponseEntity signup(@Valid SignUpRequest signUpRequest) {
        String nickname = signUpRequest.getNickname();
        String password = passwordEncoder.encode(signUpRequest.getPassword());
        String receiver = signUpRequest.getReceiver();

        Optional<User> findNickname = userRepository.findByNickname(nickname);
        if (findNickname.isPresent()) {
            throw new IllegalArgumentException("중복되는 닉네임입니다.");
        }

        UserRoleEnum role = UserRoleEnum.MEMBER;
        User user = signUpRequest.toEntity(role, password);

        userRepository.save(user);
        return ResponseEntity.ok("회원가입 성공");
    }

    /**
     * 로그인 반환값으로 user를 userResponseDto 담아 반환하고 컨트롤러에서 반환된 객체를 이용하여 토큰 발행
     */
//    @Cacheable(cacheNames = CacheNames.LOGINUSER, key = "'login' + #p0.getNickname()", unless = "#result == null")
    @Transactional
    public UserResponse login(LoginRequest loginRequest) {
        String nickname = loginRequest.getNickname();
        String password = loginRequest.getPassword();

        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("아이디 틀림")
        );
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호를 확인해주세요");
        }
        return new UserResponse().of(user); // user 객체를 dto에 담아서 반환
    }

    /**
     * 로그아웃
     * @param accessToken
     * @param nickname
     * @return
     */
    @CacheEvict(cacheNames = CacheNames.USERBYUSERNAME, key = "'login' + #p1")
    @Transactional
    public ResponseEntity logout(String accessToken, String nickname) {
        // 레디스에 accessToken 사용 못하도록 등록
        Long expiration = jwtProvider.getExpiration(accessToken);
        redisDao.setBlackList(accessToken, "logout", expiration);
        if (redisDao.hasKey(nickname)) {
            redisDao.deleteRefreshToken(nickname);
        } else {
            throw new IllegalArgumentException("이미 로그아웃한 유저입니다.");
        }
        return ResponseEntity.ok("로그아웃 완료");
    }

    /**
     * nickname에 기반하여 사용자 정보를 가져오는 메서드
     *
     * @param nickname 사용자의 별명 (사용자명).
     * @return 사용자 정보를 담은 UserResponse 객체.
     */
    @Transactional
    public UserResponse getUserInfo(String nickname) {
        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("닉네임 " + nickname + "인 사용자를 찾을 수 없습니다."));
        return UserResponse.of(user);
    }

    @Transactional
    public UserResponse getTicket(String nickname) {
        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("닉네임 " + nickname + "인 사용자를 찾을 수 없습니다."));
        user.ticketUp();
        return UserResponse.of(user);
    }
    @Transactional
    public UserResponse getDoubleTicket(String nickname) {
        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("닉네임 " + nickname + "인 사용자를 찾을 수 없습니다."));
        user.ticketDoubleUp();
        return UserResponse.of(user);
    }

    @Transactional
    public ResponseEntity savePost(String nickname, String content, int date) throws DifferentDateError, AlreadyExistsError{
        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("해당 닉네임을 가진 사용자를 찾을 수 없습니다.")
        );

        LocalDateTime currentDate = LocalDateTime.now();
        ZoneId zoneId = ZoneId.of("Asia/Seoul");
        ZonedDateTime zonedDateTime = currentDate.atZone(zoneId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        if (zonedDateTime.getDayOfMonth() != date) {
            throw new DifferentDateError(zonedDateTime.format(formatter)+"오늘이 아닙니다");
        }
        Optional<Post> existingPost = postRepository.findByUserAndDate(user, date);

        if (existingPost.isPresent()) {
            throw new AlreadyExistsError();
        }

        Post post = Post.builder()
                .content(content)
                .user(user)
                .date(date)
                .build();

        user.addPost(post);
        userRepository.save(user);

        return ResponseEntity.ok("글이 성공적으로 저장되었습니다.");
    }

    @Transactional
    public ResponseEntity saveTicketPost(String nickname, String content, int date) throws DifferentDateError, AlreadyExistsError,NoTicketError{
        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("해당 닉네임을 가진 사용자를 찾을 수 없습니다.")
        );
        if(user.getTicket()<=0){
            throw new NoTicketError();
        }

        LocalDateTime currentDate = LocalDateTime.now();
        ZoneId zoneId = ZoneId.of("Asia/Seoul"); // 원하는 시간대로 변경
        ZonedDateTime zonedDateTime = currentDate.atZone(zoneId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        if (zonedDateTime.getDayOfMonth() <= date) {
            throw new DifferentDateError(zonedDateTime.format(formatter)+"현재 날짜보다 이전이어야 합니다");
        }
        Optional<Post> existingPost = postRepository.findByUserAndDate(user, date);

        if (existingPost.isPresent()) {
            throw new AlreadyExistsError();
        }
        user.ticketDown();
        Post post = Post.builder()
                .content(content)
                .user(user)
                .date(date)
                .build();

        user.addPost(post);
        userRepository.save(user);

        return ResponseEntity.ok("이용권을 사용하여 글이 성공적으로 저장되었습니다.");
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getUserPosts(String nickname) {
        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("해당 닉네임을 가진 사용자를 찾을 수 없습니다.")
        );

        List<Post> userPosts = user.getPosts();
        List<PostResponse> postResponses = userPosts.stream()
                .map(PostResponse::of)
                .collect(Collectors.toList());

        return postResponses;
    }
    @Transactional(readOnly = true)
    public List<PostResponse> getNicknamePosts(String nickname){
        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("해당 닉네임을 가진 사용자를 찾을 수 없습니다.")
        );

        List<Post> userPosts = user.getPosts();
        List<PostResponse> postResponses = userPosts.stream()
                .map(PostResponse::of)
                .collect(Collectors.toList());

        return postResponses;
    }

    @Transactional
    public ResponseEntity updateReceiver(String nickname, String newReceiver) {
        User user = userRepository.findByNickname(nickname).orElseThrow(
                () -> new RuntimeException("해당 닉네임을 가진 사용자를 찾을 수 없습니다.")
        );

        user.setReceiver(newReceiver);
        userRepository.save(user);

        return ResponseEntity.ok("Receiver 정보 업데이트");
    }


}
