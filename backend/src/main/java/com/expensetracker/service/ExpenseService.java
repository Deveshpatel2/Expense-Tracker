package com.expensetracker.service;

import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    public Expense createExpense(ExpenseRequest expenseRequest, User user) {
        Expense expense = new Expense(
                expenseRequest.getDescription(),
                expenseRequest.getAmount(),
                expenseRequest.getCategory(),
                expenseRequest.getExpenseDate(),
                expenseRequest.getNotes(),
                expenseRequest.getCurrency(),
                user
        );
        
        return expenseRepository.save(expense);
    }
    
    public List<Expense> getExpensesByUser(User user) {
        return expenseRepository.findByUserOrderByExpenseDateDesc(user);
    }
    
    public Page<Expense> getExpensesByUser(User user, Pageable pageable) {
        return expenseRepository.findByUserOrderByExpenseDateDesc(user, pageable);
    }
    
    public List<Expense> getExpensesByUserAndFilters(User user, String category, 
                                                     LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserAndFilters(user, category, startDate, endDate);
    }
    
    public List<Expense> getExpensesByCategory(User user, String category) {
        return expenseRepository.findByUserAndCategoryOrderByExpenseDateDesc(user, category);
    }
    
    public List<Expense> getExpensesByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserAndExpenseDateBetweenOrderByExpenseDateDesc(user, startDate, endDate);
    }
    
    public List<Expense> searchExpenses(User user, String searchTerm) {
        return expenseRepository.findByUserAndDescriptionContaining(user, searchTerm);
    }
    
    public Expense updateExpense(Long expenseId, ExpenseRequest expenseRequest, User user) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + expenseId));
        
        // Check if the expense belongs to the user
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to update this expense");
        }
        
        expense.setDescription(expenseRequest.getDescription());
        expense.setAmount(expenseRequest.getAmount());
        expense.setCategory(expenseRequest.getCategory());
        expense.setExpenseDate(expenseRequest.getExpenseDate());
        expense.setNotes(expenseRequest.getNotes());
        expense.setCurrency(expenseRequest.getCurrency());
        
        return expenseRepository.save(expense);
    }
    
    public void deleteExpense(Long expenseId, User user) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + expenseId));
        
        // Check if the expense belongs to the user
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to delete this expense");
        }
        
        expenseRepository.delete(expense);
    }
    
    public Map<String, Double> getTotalByCurrency(User user) {
        List<Object[]> results = expenseRepository.getTotalByCurrency(user);
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> ((Number) result[1]).doubleValue()
                ));
    }
    
    public Map<String, Double> getAverageByCurrency(User user) {
        List<Object[]> results = expenseRepository.getAverageByCurrency(user);
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> ((Number) result[1]).doubleValue()
                ));
    }
    
    public Map<String, Double> getTotalByCategory(User user) {
        List<Object[]> results = expenseRepository.getTotalByCategory(user);
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> ((Number) result[1]).doubleValue()
                ));
    }
    
    public Map<String, Long> getCountByCategory(User user) {
        List<Object[]> results = expenseRepository.getCountByCategory(user);
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> ((Number) result[1]).longValue()
                ));
    }
    
    public Expense findById(Long expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + expenseId));
    }
}
