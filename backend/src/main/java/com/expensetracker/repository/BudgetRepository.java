package com.expensetracker.repository;

import com.expensetracker.entity.Budget;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Find budgets by user and month
    List<Budget> findByUserAndBudgetMonthOrderByCategoryAsc(User user, LocalDate budgetMonth);

    // Find budget by user, category, and month
    Optional<Budget> findByUserAndCategoryAndBudgetMonth(User user, String category, LocalDate budgetMonth);

    // Find all budgets for a user
    List<Budget> findByUserOrderByBudgetMonthDescCategoryAsc(User user);

    // Find budget templates by user
    List<Budget> findByUserAndIsTemplateTrueOrderByTemplateNameAsc(User user);

    // Find budget templates by user and template name
    List<Budget> findByUserAndIsTemplateTrueAndTemplateNameOrderByCategoryAsc(User user, String templateName);

    // Find budgets by user and category
    List<Budget> findByUserAndCategoryOrderByBudgetMonthDesc(User user, String category);

    // Find budgets for a specific month range
    @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.budgetMonth BETWEEN :startDate AND :endDate ORDER BY b.budgetMonth DESC, b.category ASC")
    List<Budget> findByUserAndBudgetMonthBetween(@Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Find budgets that need alerts (utilization >= threshold)
    @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.budgetMonth = :budgetMonth AND b.alertThreshold IS NOT NULL")
    List<Budget> findBudgetsForAlertCheck(@Param("user") User user, @Param("budgetMonth") LocalDate budgetMonth);

    // Check if budget exists for user, category, and month
    boolean existsByUserAndCategoryAndBudgetMonth(User user, String category, LocalDate budgetMonth);

    // Count budgets by user and month
    long countByUserAndBudgetMonth(User user, LocalDate budgetMonth);

    // Find latest budget for each category for a user
    @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.budgetMonth = (SELECT MAX(b2.budgetMonth) FROM Budget b2 WHERE b2.user = :user AND b2.category = b.category) ORDER BY b.category ASC")
    List<Budget> findLatestBudgetsByCategory(@Param("user") User user);
}
