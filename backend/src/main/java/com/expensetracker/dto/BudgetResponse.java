package com.expensetracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BudgetResponse {

    private Long id;
    private String category;
    private BigDecimal amount;
    private String currency;
    private LocalDate budgetMonth;
    private String notes;
    private Integer alertThreshold;
    private Boolean isTemplate;
    private String templateName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Budget monitoring fields
    private BigDecimal actualSpent;
    private BigDecimal remainingAmount;
    private Double utilizationPercentage;
    private String status; // "on_track", "warning", "exceeded"
    private Boolean alertTriggered;

    // Constructors
    public BudgetResponse() {
    }

    public BudgetResponse(Long id, String category, BigDecimal amount, String currency,
            LocalDate budgetMonth, String notes, Integer alertThreshold,
            Boolean isTemplate, String templateName, LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.category = category;
        this.amount = amount;
        this.currency = currency;
        this.budgetMonth = budgetMonth;
        this.notes = notes;
        this.alertThreshold = alertThreshold;
        this.isTemplate = isTemplate;
        this.templateName = templateName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDate getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(LocalDate budgetMonth) {
        this.budgetMonth = budgetMonth;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getAlertThreshold() {
        return alertThreshold;
    }

    public void setAlertThreshold(Integer alertThreshold) {
        this.alertThreshold = alertThreshold;
    }

    public Boolean getIsTemplate() {
        return isTemplate;
    }

    public void setIsTemplate(Boolean isTemplate) {
        this.isTemplate = isTemplate;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public BigDecimal getActualSpent() {
        return actualSpent;
    }

    public void setActualSpent(BigDecimal actualSpent) {
        this.actualSpent = actualSpent;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public Double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(Double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getAlertTriggered() {
        return alertTriggered;
    }

    public void setAlertTriggered(Boolean alertTriggered) {
        this.alertTriggered = alertTriggered;
    }
}
