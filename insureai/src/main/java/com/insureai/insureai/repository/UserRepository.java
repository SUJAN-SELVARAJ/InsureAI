package com.insureai.insureai.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.insureai.insureai.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
}