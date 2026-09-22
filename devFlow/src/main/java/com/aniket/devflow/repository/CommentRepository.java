package com.aniket.devflow.repository;

import com.aniket.devflow.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    Optional<Comment> findByIdAndTaskId(Long commentId, Long taskId);
    Optional<Comment> findByIdAndTaskIdAndUserId(
            Long commentId,
            Long taskId,
            Long userId
    );
}