package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.entity.User;
import com.expensetracker.service.UserService;
import com.expensetracker.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3004"})
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = userService.register(registerRequest);
            String token = jwtUtil.generateToken(user);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("user", createUserResponse(user));
            
            return ResponseEntity.ok(ApiResponse.success("User registered successfully", responseData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("user", createUserResponse(user));
            
            return ResponseEntity.ok(ApiResponse.success("Login successful", responseData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid email or password"));
        }
    }
    
    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createGuestUser() {
        try {
            User guestUser = userService.createGuestUser();
            String token = jwtUtil.generateToken(guestUser);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("user", createUserResponse(guestUser));
            
            return ResponseEntity.ok(ApiResponse.success("Guest user created successfully", responseData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<Map<String, Object>>> googleSignIn(@RequestBody Map<String, String> googleRequest) {
        try {
            String email = googleRequest.get("email");
            String firstName = googleRequest.get("firstName");
            String lastName = googleRequest.get("lastName");
            String profilePicture = googleRequest.get("profilePicture");
            
            User user = userService.findByEmail(email).orElse(null);
            
            if (user == null) {
                // Create new user for Google sign-in
                user = new User(firstName, lastName, email, "google-password");
                user.setIsGoogleUser(true);
                user.setProfilePicture(profilePicture);
                user = userService.updateUser(user);
            }
            
            String token = jwtUtil.generateToken(user);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("user", createUserResponse(user));
            
            return ResponseEntity.ok(ApiResponse.success("Google sign-in successful", responseData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("email", user.getEmail());
        userResponse.put("profilePicture", user.getProfilePicture());
        userResponse.put("isGoogleUser", user.getIsGoogleUser());
        userResponse.put("isGuest", user.getIsGuest());
        userResponse.put("createdAt", user.getCreatedAt());
        return userResponse;
    }
}
