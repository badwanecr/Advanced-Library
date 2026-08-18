package com.libassist.library.repository;

import com.libassist.library.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    /*
     * Issue -> book and Issue -> user are LAZY, and the DTO mapping in IssueService runs after the
     * persistence context has closed (spring.jpa.open-in-view=false). These queries JOIN FETCH both
     * associations so the data is already loaded by then - otherwise mapping any row throws
     * LazyInitializationException. Fetching up front also avoids the N+1 queries that lazy-loading
     * a book and a user per issue would otherwise cause.
     */

    @Query("SELECT i FROM Issue i JOIN FETCH i.book JOIN FETCH i.user ORDER BY i.issueDate DESC")
    List<Issue> findAllDetailed();

    @Query("SELECT i FROM Issue i JOIN FETCH i.book b JOIN FETCH i.user "
            + "WHERE b.id = :bookId ORDER BY i.issueDate DESC")
    List<Issue> findByBookIdDetailed(@Param("bookId") Long bookId);

    @Query("SELECT i FROM Issue i JOIN FETCH i.book JOIN FETCH i.user u "
            + "WHERE u.id = :userId ORDER BY i.issueDate DESC")
    List<Issue> findByUserIdDetailed(@Param("userId") Long userId);

    @Query("SELECT i FROM Issue i JOIN FETCH i.book b JOIN FETCH i.user u "
            + "WHERE b.id = :bookId AND u.id = :userId ORDER BY i.issueDate DESC")
    List<Issue> findByBookIdAndUserIdDetailed(@Param("bookId") Long bookId, @Param("userId") Long userId);
}
