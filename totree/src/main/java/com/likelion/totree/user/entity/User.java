package com.likelion.totree.user.entity;

import com.likelion.totree.security.exception.DoubleTicketIssueException;
import com.likelion.totree.security.exception.TicketIssueException;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "USERS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Long id;

    private int[] ornament;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private int ticket=0;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String receiver;

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private UserRoleEnum role;

    private Boolean inUser;  // 추후 휴면계정 관리 시 사용

    private LocalDateTime lastTicketUpTime;
    private LocalDateTime lastDoubleTicketUpTime;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>();

    @Builder
    public User(String nickname, String password, String receiver, UserRoleEnum role, int ticket) {
        this.nickname = nickname;
        this.password = password;
        this.receiver = receiver;
        this.role = role;
        this.ornament =  getArray();
        this.ticket=ticket;
        this.posts = new ArrayList<>();
    }

//    public void ticketUp(){
//        this.ticket+=1;
//    }
//
//    public void ticketDoubleUp(){
//        this.ticket+=2;
//    }

    /**이전 코드*/
//    public void ticketUp() {
//        LocalDateTime now = LocalDateTime.now();
//        if (canIssueTicket(now, lastTicketUpTime, 1)) {
//            this.ticket += 1;
//            this.lastTicketUpTime = now;
//        } else {
//            throw new RuntimeException("티켓 발급은 1분에 한 번만 가능");
//        }
//    }
    public void ticketUp() {
        LocalDateTime now = LocalDateTime.now();
        if (canIssueTicket(now, lastTicketUpTime, 360)) {
            this.ticket += 1;
            this.lastTicketUpTime = now;
        } else {
            throw new TicketIssueException();
        }
    }

    public void ticketDoubleUp() {
        LocalDateTime now = LocalDateTime.now();
        if (canIssueTicket(now, lastDoubleTicketUpTime, 720)) {
            this.ticket += 2;
            this.lastDoubleTicketUpTime = now;
        } else {
            throw new DoubleTicketIssueException();
        }
    }

    private boolean canIssueTicket(LocalDateTime now, LocalDateTime lastTime, int count) {
        return lastTime== null || ChronoUnit.MINUTES.between(lastTime, now) >= count;
    }
    public void ticketDown(){
        this.ticket-=1;
    }

    private int[] getArray() {
        List<Integer> shuffledList = new ArrayList<>();

        for (int i = 0; i < 24; i++) {
            shuffledList.add(i);
        }


        Collections.shuffle(shuffledList);
        shuffledList.add(24);
        int[] shuffledArray = shuffledList.stream().mapToInt(Integer::intValue).toArray();


        return shuffledArray;
    }

    public void addPost(Post post) {
        this.posts.add(post);
        post.setUser(this);
    }

    public void setReceiver(String newReceiver) {
        this.receiver = newReceiver;
    }
}
