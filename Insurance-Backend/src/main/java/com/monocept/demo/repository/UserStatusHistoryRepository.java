package com.monocept.demo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.monocept.demo.entity.UserStatusHistory;

@Repository
public interface UserStatusHistoryRepository extends JpaRepository<UserStatusHistory, Long> {

	Page<UserStatusHistory> findByUserUserId(Long userId, Pageable pageable);
}
