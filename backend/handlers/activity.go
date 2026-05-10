package handlers

import (
	"math-association/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ActivityHandler struct {
	DB *gorm.DB
}

func (h *ActivityHandler) GetPublicActivities(c *gin.Context) {
	var activities []models.Activity
	h.DB.Where("is_published = ? AND (visibility = ? OR visibility = ?)", true, "public", "both").
		Order("sort_order ASC, created_at DESC").
		Find(&activities)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": activities})
}

func (h *ActivityHandler) GetAllActivities(c *gin.Context) {
	var activities []models.Activity
	h.DB.Order("sort_order ASC, created_at DESC").Find(&activities)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": activities})
}

func (h *ActivityHandler) CreateActivity(c *gin.Context) {
	var activity models.Activity
	if err := c.ShouldBindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	if err := h.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": activity, "message": "创建成功"})
}

func (h *ActivityHandler) UpdateActivity(c *gin.Context) {
	id := c.Param("id")
	var activity models.Activity
	if err := h.DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "活动不存在"})
		return
	}

	var req struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		Period      string     `json:"period"`
		Icon        string     `json:"icon"`
		SortOrder   int        `json:"sort_order"`
		IsPublished bool        `json:"is_published"`
		Visibility  string     `json:"visibility"`
		PublishAt   *string    `json:"publish_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	updates := map[string]interface{}{}
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Period != "" {
		updates["period"] = req.Period
	}
	if req.Icon != "" {
		updates["icon"] = req.Icon
	}
	updates["sort_order"] = req.SortOrder
	updates["is_published"] = req.IsPublished
	if req.Visibility != "" {
		updates["visibility"] = req.Visibility
	}
	if req.PublishAt != nil {
		updates["publish_at"] = *req.PublishAt
	} else {
		updates["publish_at"] = nil
	}

	h.DB.Model(&activity).Updates(updates)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (h *ActivityHandler) DeleteActivity(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Activity{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}