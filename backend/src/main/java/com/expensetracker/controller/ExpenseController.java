package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ApiResponse<Expense>> createExpense(@Valid @RequestBody ExpenseRequest expenseRequest,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Expense expense = expenseService.createExpense(expenseRequest, user);
            return ResponseEntity.ok(ApiResponse.success("Expense created successfully", expense));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Expense>>> getExpenses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Expense> expenses;

            if (search != null && !search.trim().isEmpty()) {
                expenses = expenseService.searchExpenses(user, search);
            } else if (category != null || startDate != null || endDate != null) {
                LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
                LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;
                expenses = expenseService.getExpensesByUserAndFilters(user, category, start, end);
            } else {
                expenses = expenseService.getExpensesByUser(user);
            }

            return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", expenses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Expense>> getExpense(@PathVariable Long id,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Expense expense = expenseService.findById(id);

            // Check if the expense belongs to the user
            if (!expense.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("You don't have permission to view this expense"));
            }

            return ResponseEntity.ok(ApiResponse.success("Expense retrieved successfully", expense));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Expense>> updateExpense(@PathVariable Long id,
            @Valid @RequestBody ExpenseRequest expenseRequest,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Expense expense = expenseService.updateExpense(id, expenseRequest, user);
            return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", expense));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            expenseService.deleteExpense(id, user);
            return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/statistics/totals")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getTotalByCurrency(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Double> totals = expenseService.getTotalByCurrency(user);
            return ResponseEntity.ok(ApiResponse.success("Totals retrieved successfully", totals));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/statistics/averages")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getAverageByCurrency(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Double> averages = expenseService.getAverageByCurrency(user);
            return ResponseEntity.ok(ApiResponse.success("Averages retrieved successfully", averages));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/statistics/categories")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getTotalByCategory(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Double> categoryTotals = expenseService.getTotalByCategory(user);
            return ResponseEntity.ok(ApiResponse.success("Category totals retrieved successfully", categoryTotals));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/statistics/counts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCountByCategory(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Long> categoryCounts = expenseService.getCountByCategory(user);
            return ResponseEntity.ok(ApiResponse.success("Category counts retrieved successfully", categoryCounts));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
