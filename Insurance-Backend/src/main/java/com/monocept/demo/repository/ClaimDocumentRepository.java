package com.monocept.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.monocept.demo.entity.ClaimDocument;

@Repository
public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, Long> {

}