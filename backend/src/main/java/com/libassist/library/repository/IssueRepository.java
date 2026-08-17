package com.libassist.library.repository;

import com.libassist.library.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByBookIdOrderByIssueDateDesc(Long bookId);

    List<Issue> findByUserIdOrderByIssueDateDesc(Long userId);

    List<Issue> findByBookIdAndUserIdOrderByIssueDateDesc(Long bookId, Long userId);

    List<Issue> findAllByOrderByIssueDateDesc();
}
