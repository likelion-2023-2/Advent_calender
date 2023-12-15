package com.likelion.totree.user.entity;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;
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

    public void ticketUp(){
        this.ticket+=1;
    }

    public void ticketDoubleUp(){
        this.ticket+=2;
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
