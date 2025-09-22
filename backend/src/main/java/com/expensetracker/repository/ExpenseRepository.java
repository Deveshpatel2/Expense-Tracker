package com.expensetracker.repository;

import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByUserOrderByExpenseDateDesc(User user);
    
    Page<Expense> findByUserOrderByExpenseDateDesc(User user, Pageable pageable);
    
    List<Expense> findByUserAndCategoryOrderByExpenseDateDesc(User user, String category);
    
    List<Expense> findByUserAndExpenseDateBetweenOrderByExpenseDateDesc(User user, LocalDate startDate, LocalDate endDate);
    
    List<Expense> findByUserAndCategoryAndExpenseDateBetweenOrderByExpenseDateDesc(
            User user, String category, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT e FROM Expense e WHERE e.user = :user AND " +
           "(:category IS NULL OR e.category = :category) AND " +
           "(:startDate IS NULL OR e.expenseDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.expenseDate <= :endDate) " +
           "ORDER BY e.expenseDate DESC")
    List<Expense> findByUserAndFilters(@Param("user") User user,
                                       @Param("category") String category,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e.currency, SUM(e.amount) FROM Expense e WHERE e.user = :user GROUP BY e.currency")
    List<Object[]> getTotalByCurrency(@Param("user") User user);
    
    @Query("SELECT e.currency, AVG(e.amount) FROM Expense e WHERE e.user = :user GROUP BY e.currency")
    List<Object[]> getAverageByCurrency(@Param("user") User user);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user = :user GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> getTotalByCategory(@Param("user") User user);
    
    @Query("SELECT e.category, COUNT(e) FROM Expense e WHERE e.user = :user GROUP BY e.category ORDER BY COUNT(e) DESC")
    List<Object[]> getCountByCategory(@Param("user") User user);
    
    @Query("SELECT e FROM Expense e WHERE e.user = :user AND e.description LIKE %:searchTerm% ORDER BY e.expenseDate DESC")
    List<Expense> findByUserAndDescriptionContaining(@Param("user") User user, @Param("searchTerm") String searchTerm);
}
