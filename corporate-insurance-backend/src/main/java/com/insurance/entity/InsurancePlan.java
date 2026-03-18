package com.insurance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "insurance_plans")
public class InsurancePlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Plan name is required")
    @Size(max = 200)
    @Column(name = "plan_name")
    private String planName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false)
    private PlanType planType;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "coverage_amount", precision = 15, scale = 2)
    private BigDecimal coverageAmount;
    
    @NotNull(message = "Premium amount is required")
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "premium_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal premiumAmount;
    
    @NotNull(message = "Duration is required")
    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @JsonIgnore
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CustomerPlan> customerPlans;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum PlanType {
        HEALTH, LIFE, PROPERTY, LIABILITY, VEHICLE
    }
    
    // Constructors
    public InsurancePlan() {}
    
    public InsurancePlan(String planName, PlanType planType, String description, 
                       BigDecimal coverageAmount, BigDecimal premiumAmount, Integer durationMonths) {
        this.planName = planName;
        this.planType = planType;
        this.description = description;
        this.coverageAmount = coverageAmount;
        this.premiumAmount = premiumAmount;
        this.durationMonths = durationMonths;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    
    public PlanType getPlanType() { return planType; }
    public void setPlanType(PlanType planType) { this.planType = planType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getCoverageAmount() { return coverageAmount; }
    public void setCoverageAmount(BigDecimal coverageAmount) { this.coverageAmount = coverageAmount; }
    
    public BigDecimal getPremiumAmount() { return premiumAmount; }
    public void setPremiumAmount(BigDecimal premiumAmount) { this.premiumAmount = premiumAmount; }
    
    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
