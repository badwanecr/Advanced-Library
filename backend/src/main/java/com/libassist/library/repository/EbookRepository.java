package com.libassist.library.repository;

import com.libassist.library.entity.Ebook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EbookRepository extends JpaRepository<Ebook, Long> {

    List<Ebook> findAllByOrderByTitleAsc();
}
