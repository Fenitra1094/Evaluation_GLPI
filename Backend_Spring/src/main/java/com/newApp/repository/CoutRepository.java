package com.newApp.repository;

import com.newApp.entity.Cout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
 
@Transactional
public interface CoutRepository extends JpaRepository<Cout, Long> {
    Optional<Cout> findById(Long Id);

    // @Transactional
    // @Modifying
    // @Query("delete from cout b where b.ticket=:ticket")
    void deleteByTicket(@Param("ticket") Integer ticket); 

    
    
}