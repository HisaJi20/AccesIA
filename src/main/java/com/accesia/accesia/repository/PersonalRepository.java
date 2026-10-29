package com.accesia.accesia.repository;

import com.accesia.accesia.model.Personal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonalRepository extends JpaRepository<Personal, Integer> {
}