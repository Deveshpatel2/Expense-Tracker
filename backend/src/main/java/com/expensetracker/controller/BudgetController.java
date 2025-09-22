package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.User;
import com.expensetracker.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping
    public ResponseEntity<ApiResponse<Budget>> createBudget(@Valid @RequestBody BudgetRequest budgetRequest,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Budget budget = budgetService.createBudget(budgetRequest, user);
            return ResponseEntity.ok(ApiResponse.success("Budget created successfully", budget));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<BudgetResponse> budgets;

            if (month != null) {
                budgets = budgetService.getBudgetsByUserAndMonth(user, month);
            } else {
                budgets = budgetService.getAllBudgetsByUser(user);
            }

            return ResponseEntity.ok(ApiResponse.success("Budgets retrieved successfully", budgets));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudget(@PathVariable Long id,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            BudgetResponse budget = budgetService.getBudgetById(id, user);
            return ResponseEntity.ok(ApiResponse.success("Budget retrieved successfully", budget));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Budget>> updateBudget(@PathVariable Long id,
            @Valid @RequestBody BudgetRequest budgetRequest,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Budget budget = budgetService.updateBudget(id, budgetRequest, user);
            return ResponseEntity.ok(ApiResponse.success("Budget updated successfully", budget));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(@PathVariable Long id,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            budgetService.deleteBudget(id, user);
            return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/templates/{templateName}/create")
    public ResponseEntity<ApiResponse<List<Budget>>> createFromTemplate(
            @PathVariable String templateName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetMonth,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Budget> budgets = budgetService.createBudgetFromTemplate(templateName, targetMonth, user);
            return ResponseEntity.ok(ApiResponse.success("Budgets created from template successfully", budgets));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/copy-to-next-month")
    public ResponseEntity<ApiResponse<List<Budget>>> copyToNextMonth(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sourceMonth,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Budget> budgets = budgetService.copyBudgetToNextMonth(sourceMonth, user);
            return ResponseEntity.ok(ApiResponse.success("Budgets copied to next month successfully", budgets));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgetTemplates(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<BudgetResponse> templates = budgetService.getBudgetTemplates(user);
            return ResponseEntity.ok(ApiResponse.success("Budget templates retrieved successfully", templates));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBudgetSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Object> summary = budgetService.getBudgetSummary(user, month);
            return ResponseEntity.ok(ApiResponse.success("Budget summary retrieved successfully", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
