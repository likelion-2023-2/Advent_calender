package com.likelion.totree.user.controller;

import com.likelion.totree.security.dto.TokenResponse;
import com.likelion.totree.security.exception.*;
import com.likelion.totree.security.jwt.JwtProvider;
import com.likelion.totree.security.service.UserDetailsImpl;
import com.likelion.totree.user.dto.*;
import com.likelion.totree.user.entity.Post;
import com.likelion.totree.user.entity.User;
import com.likelion.totree.user.repository.PostRepository;
import com.likelion.totree.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000, https://totree.netlify.app")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtProvider jwtProvider;

    private final PostRepository postRepository;

    /**
     * 회원가입
     *
     * @param signUpRequest
     * @return 회원가입 성공
     */
    @PostMapping("/signup")
    public ResponseEntity signup(@RequestBody @Valid SignUpRequest signUpRequest) {
        if (!signUpRequest.getPassword().equals(signUpRequest.getPassword2())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다. 다시 입력해주세요.");
        }
        return userService.signup(signUpRequest);
    }

    /**
     * 로그인
     * 로그인 시 atk, rtk 이 생성되어 response header 에 담아 보낸다.
     * rtk 는 레디스에 저장한다. 추후 atk 만료시 rtk를 이용해 atk 재발급 하기 위함
     */
    @PostMapping("/login")
    public TokenResponse login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        UserResponse user = userService.login(loginRequest);
        TokenResponse token = jwtProvider.createTokenByLogin(user.getNickname(), user.getRole()); // atk, rtk 생성
        response.addHeader(jwtProvider.AUTHORIZATION_HEADER, token.getAccessToken());  // 헤더에 엑세스 토큰만 싣기
        return token;
    }

    /**
     * 로그아웃
     * 현 accessToken 은 다시 사용하지 못하도록 레디스에 저장해두고,
     * 로그아웃시 레디스에 저장된 refreshToken 삭제
     * @param userDetails
     * @param request
     * @return
     */
    @DeleteMapping("/logout")
    public ResponseEntity logout(@AuthenticationPrincipal UserDetailsImpl userDetails, HttpServletRequest request) {
        String accessToken = jwtProvider.resolveToken(request);
        return userService.logout(accessToken, userDetails.getUsername()); // username = nickname
    }

    /**
     *  해당 유저의 정보 확인
     * @param userDetails
     * @return
     */
    @GetMapping("/user-info")
    public UserResponse getUserInfo(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return userService.getUserInfo(userDetails.getUsername());  // username = nickname
    }

//    @GetMapping("/get-ticket")
//    public UserResponse getTicket(@AuthenticationPrincipal UserDetailsImpl userDetails) {
//        return userService.getTicket(userDetails.getUsername());  // username = nickname
//    }
    @GetMapping("/get-ticket")
    public ResponseEntity<Object> getTicket(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            UserResponse userResponse = userService.getTicket(userDetails.getUsername());
            return ResponseEntity.ok().body(userResponse);
        } catch (TicketIssueException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }  // username = nickname
    }

//    @GetMapping("/get-double-ticket")
//    public UserResponse getDoubleTicket(@AuthenticationPrincipal UserDetailsImpl userDetails) {
//        return userService.getDoubleTicket(userDetails.getUsername());  // username = nickname
//    }

    @GetMapping("/get-double-ticket")
    public ResponseEntity<Object> getDoubleTicket(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            UserResponse userResponse = userService.getDoubleTicket(userDetails.getUsername());
            return ResponseEntity.ok().body(userResponse);
        } catch (DoubleTicketIssueException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     *  AccessToken  재발급
     * 매 API 호출 시 시큐리티필터를 통해 인증인가를 받게  된다. 이때 만료된 토큰인지 검증하고 만료시 만료된토큰임을 에러메세지로 보낸다.
     * 그럼 클라이언트에서 에러메세지를 확인 후 이 api(atk 재발급 ) 을 요청 하게 된다.
     * @param userDetails
     * @param tokenRequest : refreshToken
     * @return AccessToken + RefreshToken
     */
    @PostMapping("/reissue-token")
    public TokenResponse reissueToken(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                      @RequestBody ReissueTokenRequest tokenRequest) {
        // 유저 객체 정보를 이용하여 토큰 발행
        UserResponse user = UserResponse.of(userDetails.getUser());
        return jwtProvider.reissueAtk(user.getNickname(), user.getRole(), tokenRequest.getRefreshToken());
    }

    @PostMapping("/post/{date}")
    public ResponseEntity<String> savePost(
            @PathVariable int date,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        LocalDate currentDate = LocalDate.now();
        String content = requestBody.get("content");


        try{
            userService.savePost(userDetails.getUsername(), content, date);
            return ResponseEntity.ok("글이 성공적으로 저장되었습니다.");
        }catch(AlreadyExistsError e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }catch (DifferentDateError e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        }catch(NoTicketError e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }

    }

//    @PostMapping("/repost/{date}")
//    public ResponseEntity<String> saveRePost(
//            @PathVariable int date,
//            @RequestBody Map<String, String> requestBody,
//            @AuthenticationPrincipal UserDetailsImpl userDetails) {
//
//        LocalDate currentDate = LocalDate.now();
//        String content = requestBody.get("content");
//
//
//        try{
//            userService.saveRePost(userDetails.getUsername(), content, date);
//            return ResponseEntity.ok("글이 성공적으로 저장되었습니다.");
//        }catch(AlreadyExistsError e){
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        }catch (DifferentDateError e){
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//
//        }catch(NoTicketError e){
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        }
//
//    }

    @PostMapping("/ticket/post/{date}")
    public ResponseEntity<String> ticketSavePost(
            @PathVariable int date,
            @RequestBody Map<String, String> requestBody,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        LocalDate currentDate = LocalDate.now();
        String content = requestBody.get("content");


        try{
            userService.saveTicketPost(userDetails.getUsername(), content, date);
            return ResponseEntity.ok("이용권을 사용하여 글이 성공적으로 저장되었습니다.");
        }catch(AlreadyExistsError e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }catch (DifferentDateError e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        }catch(NoTicketError e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }

    }


    @GetMapping("/readposts")
    public ResponseEntity<List<PostResponse>> getUserPosts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<PostResponse> userPosts = userService.getUserPosts(userDetails.getUsername());
        List<PostResponse> sortedUserPosts=userPosts.stream()
                .sorted(Comparator.comparingInt(PostResponse::getDate))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userPosts);
    }

    @PatchMapping("/update-receiver")
    public ResponseEntity updateReceiver(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @RequestBody Map<String, String> requestBody) {
        String newReceiver = requestBody.get("newReceiver");
        userService.updateReceiver(userDetails.getUsername(), newReceiver);
        return ResponseEntity.ok("Receiver 정보 업데이트");
    }

}
