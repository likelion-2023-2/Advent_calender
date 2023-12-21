package com.likelion.totree.user.dto;

import com.likelion.totree.user.entity.Post;
import com.likelion.totree.user.entity.UserRoleEnum;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor(force = true)
public class PublishResponse {
    private  String nickname;
    private String receiver;
    //private final UserRoleEnum role;

    private  int[] ornament;
    // private  int ticket;
    private  List<PostResponse> postList;
}
