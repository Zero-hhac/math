package handlers

import (
	"math-association/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CompetitionHandler struct {
	DB *gorm.DB
}

func (h *CompetitionHandler) GetCompetitions(c *gin.Context) {
	var competitions []models.Competition
	h.DB.Order("created_at DESC").Find(&competitions)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": competitions})
}

func (h *CompetitionHandler) CreateCompetition(c *gin.Context) {
	var comp models.Competition
	if err := c.ShouldBindJSON(&comp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}
	if err := h.DB.Create(&comp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": comp, "message": "创建成功"})
}

func (h *CompetitionHandler) UpdateCompetition(c *gin.Context) {
	id := c.Param("id")
	var comp models.Competition
	if err := h.DB.First(&comp, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "竞赛不存在"})
		return
	}
	if err := c.ShouldBindJSON(&comp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}
	h.DB.Model(&comp).Updates(comp)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (h *CompetitionHandler) DeleteCompetition(c *gin.Context) {
	id := c.Param("id")
	idNum, _ := strconv.Atoi(id)
	if err := h.DB.Delete(&models.Competition{}, idNum).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
