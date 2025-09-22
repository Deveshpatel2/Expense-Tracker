package com.expensetracker.service;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public Budget createBudget(BudgetRequest budgetRequest, User user) {
        // Check if budget already exists for this category and month
        if (budgetRepository.existsByUserAndCategoryAndBudgetMonth(
                user, budgetRequest.getCategory(), budgetRequest.getBudgetMonth())) {
            throw new RuntimeException("Budget already exists for this category and month");
        }

        Budget budget = new Budget(
                budgetRequest.getCategory(),
                budgetRequest.getAmount(),
                budgetRequest.getCurrency(),
                budgetRequest.getBudgetMonth(),
                budgetRequest.getNotes(),
                budgetRequest.getAlertThreshold(),
                budgetRequest.getIsTemplate(),
                budgetRequest.getTemplateName(),
                user);

        return budgetRepository.save(budget);
    }

    public List<BudgetResponse> getBudgetsByUserAndMonth(User user, LocalDate budgetMonth) {
        List<Budget> budgets = budgetRepository.findByUserAndBudgetMonthOrderByCategoryAsc(user, budgetMonth);
        return budgets.stream()
                .map(budget -> createBudgetResponseWithMonitoring(budget, user, budgetMonth))
                .collect(Collectors.toList());
    }

    public List<BudgetResponse> getAllBudgetsByUser(User user) {
        List<Budget> budgets = budgetRepository.findByUserOrderByBudgetMonthDescCategoryAsc(user);
        return budgets.stream()
                .map(budget -> createBudgetResponseWithMonitoring(budget, user, budget.getBudgetMonth()))
                .collect(Collectors.toList());
    }

    public BudgetResponse getBudgetById(Long id, User user) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to view this budget");
        }

        return createBudgetResponseWithMonitoring(budget, user, budget.getBudgetMonth());
    }

    public Budget updateBudget(Long id, BudgetRequest budgetRequest, User user) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to update this budget");
        }

        // Check if updating to a different category/month combination that already
        // exists
        if (!budget.getCategory().equals(budgetRequest.getCategory()) ||
                !budget.getBudgetMonth().equals(budgetRequest.getBudgetMonth())) {
            if (budgetRepository.existsByUserAndCategoryAndBudgetMonth(
                    user, budgetRequest.getCategory(), budgetRequest.getBudgetMonth())) {
                throw new RuntimeException("Budget already exists for this category and month");
            }
        }

        budget.setCategory(budgetRequest.getCategory());
        budget.setAmount(budgetRequest.getAmount());
        budget.setCurrency(budgetRequest.getCurrency());
        budget.setBudgetMonth(budgetRequest.getBudgetMonth());
        budget.setNotes(budgetRequest.getNotes());
        budget.setAlertThreshold(budgetRequest.getAlertThreshold());
        budget.setIsTemplate(budgetRequest.getIsTemplate());
        budget.setTemplateName(budgetRequest.getTemplateName());
        budget.setUpdatedAt(java.time.LocalDateTime.now());

        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id, User user) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to delete this budget");
        }

        budgetRepository.delete(budget);
    }

    public List<Budget> createBudgetFromTemplate(String templateName, LocalDate targetMonth, User user) {
        List<Budget> templates = budgetRepository.findByUserAndIsTemplateTrueAndTemplateNameOrderByCategoryAsc(user,
                templateName);

        if (templates.isEmpty()) {
            throw new RuntimeException("Template not found");
        }

        List<Budget> newBudgets = new ArrayList<>();
        for (Budget template : templates) {
            // Check if budget already exists for this category and month
            if (!budgetRepository.existsByUserAndCategoryAndBudgetMonth(user, template.getCategory(), targetMonth)) {
                Budget newBudget = new Budget(
                        template.getCategory(),
                        template.getAmount(),
                        template.getCurrency(),
                        targetMonth,
                        template.getNotes(),
                        template.getAlertThreshold(),
                        false, // Not a template
                        null, // No template name
                        user);
                newBudgets.add(budgetRepository.save(newBudget));
            }
        }

        return newBudgets;
    }

    public List<Budget> copyBudgetToNextMonth(LocalDate sourceMonth, User user) {
        List<Budget> sourceBudgets = budgetRepository.findByUserAndBudgetMonthOrderByCategoryAsc(user, sourceMonth);
        LocalDate nextMonth = sourceMonth.plusMonths(1);

        List<Budget> newBudgets = new ArrayList<>();
        for (Budget sourceBudget : sourceBudgets) {
            // Check if budget already exists for next month
            if (!budgetRepository.existsByUserAndCategoryAndBudgetMonth(user, sourceBudget.getCategory(), nextMonth)) {
                Budget newBudget = new Budget(
                        sourceBudget.getCategory(),
                        sourceBudget.getAmount(),
                        sourceBudget.getCurrency(),
                        nextMonth,
                        sourceBudget.getNotes(),
                        sourceBudget.getAlertThreshold(),
                        false,
                        null,
                        user);
                newBudgets.add(budgetRepository.save(newBudget));
            }
        }

        return newBudgets;
    }

    public List<BudgetResponse> getBudgetTemplates(User user) {
        List<Budget> templates = budgetRepository.findByUserAndIsTemplateTrueOrderByTemplateNameAsc(user);
        return templates.stream()
                .map(this::createBasicBudgetResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getBudgetSummary(User user, LocalDate budgetMonth) {
        List<Budget> budgets = budgetRepository.findByUserAndBudgetMonthOrderByCategoryAsc(user, budgetMonth);

        BigDecimal totalBudget = budgets.stream()
                .map(Budget::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = calculateTotalSpent(user, budgetMonth);

        BigDecimal remaining = totalBudget.subtract(totalSpent);

        double utilizationPercentage = totalBudget.compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.divide(totalBudget, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                        .doubleValue()
                : 0.0;

        Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("totalBudget", totalBudget);
        summary.put("totalSpent", totalSpent);
        summary.put("remaining", remaining);
        summary.put("utilizationPercentage", utilizationPercentage);
        summary.put("budgetCount", budgets.size());
        summary.put("budgetMonth", budgetMonth);

        return summary;
    }

    private BudgetResponse createBudgetResponseWithMonitoring(Budget budget, User user, LocalDate budgetMonth) {
        BudgetResponse response = createBasicBudgetResponse(budget);

        // Calculate actual spending for this category in the budget month
        BigDecimal actualSpent = calculateCategorySpending(user, budget.getCategory(), budgetMonth);
        response.setActualSpent(actualSpent);

        // Calculate remaining amount
        BigDecimal remaining = budget.getAmount().subtract(actualSpent);
        response.setRemainingAmount(remaining);

        // Calculate utilization percentage
        double utilizationPercentage = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                ? actualSpent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                        .doubleValue()
                : 0.0;
        response.setUtilizationPercentage(utilizationPercentage);

        // Determine status and alert
        String status = "on_track";
        boolean alertTriggered = false;

        if (utilizationPercentage >= 100) {
            status = "exceeded";
            alertTriggered = true;
        } else if (utilizationPercentage >= budget.getAlertThreshold()) {
            status = "warning";
            alertTriggered = true;
        }

        response.setStatus(status);
        response.setAlertTriggered(alertTriggered);

        return response;
    }

    private BudgetResponse createBasicBudgetResponse(Budget budget) {
        BudgetResponse response = new BudgetResponse();
        response.setId(budget.getId());
        response.setCategory(budget.getCategory());
        response.setAmount(budget.getAmount());
        response.setCurrency(budget.getCurrency());
        response.setBudgetMonth(budget.getBudgetMonth());
        response.setNotes(budget.getNotes());
        response.setAlertThreshold(budget.getAlertThreshold());
        response.setIsTemplate(budget.getIsTemplate());
        response.setTemplateName(budget.getTemplateName());
        response.setCreatedAt(budget.getCreatedAt());
        response.setUpdatedAt(budget.getUpdatedAt());
        return response;
    }

    private BigDecimal calculateCategorySpending(User user, String category, LocalDate budgetMonth) {
        YearMonth yearMonth = YearMonth.from(budgetMonth);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserAndCategoryAndExpenseDateBetween(
                user, category, startDate, endDate);

        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTotalSpent(User user, LocalDate budgetMonth) {
        YearMonth yearMonth = YearMonth.from(budgetMonth);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserAndExpenseDateBetween(user, startDate, endDate);

        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
