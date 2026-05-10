package handlers

import (
	"math-association/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MemberShowcaseHandler struct {
	DB *gorm.DB
}

func (h *MemberShowcaseHandler) GetPublicMembers(c *gin.Context) {
	var showcases []models.MemberShowcase
	h.DB.Where("is_public = ?", true).
		Preload("User").
		Order("sort_order ASC, created_at DESC").
		Find(&showcases)

	// Strip sensitive info
	for i := range showcases {
		showcases[i].User.Password = ""
		if showcases[i].User.Email != "" {
			showcases[i].User.Email = maskEmail(showcases[i].User.Email)
		}
		if showcases[i].User.Phone != "" {
			showcases[i].User.Phone = maskPhone(showcases[i].User.Phone)
		}
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": showcases})
}

func (h *MemberShowcaseHandler) GetAllMembers(c *gin.Context) {
	var showcases []models.MemberShowcase
	h.DB.Preload("User").Order("sort_order ASC, created_at DESC").Find(&showcases)

	for i := range showcases {
		showcases[i].User.Password = ""
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": showcases})
}

func (h *MemberShowcaseHandler) CreateShowcase(c *gin.Context) {
	var showcase models.MemberShowcase
	if err := c.ShouldBindJSON(&showcase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	if err := h.DB.Create(&showcase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": showcase, "message": "创建成功"})
}

func (h *MemberShowcaseHandler) UpdateShowcase(c *gin.Context) {
	id := c.Param("id")
	var showcase models.MemberShowcase
	if err := h.DB.First(&showcase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "展示不存在"})
		return
	}

	if err := c.ShouldBindJSON(&showcase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	h.DB.Model(&showcase).Updates(showcase)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (h *MemberShowcaseHandler) DeleteShowcase(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.MemberShowcase{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func maskEmail(email string) string {
	if len(email) < 5 {
		return "***"
	}
	return email[:2] + "***" + email[len(email)-4:]
}

func maskPhone(phone string) string {
	if len(phone) < 7 {
		return "***"
	}
	return phone[:3] + "****" + phone[len(phone)-4:]
}
