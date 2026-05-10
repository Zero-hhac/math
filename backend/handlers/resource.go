package handlers

import (
	"math-association/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ResourceHandler struct {
	DB *gorm.DB
}

func (h *ResourceHandler) GetResources(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID := c.Query("category_id")
	resourceType := c.Query("resource_type")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}

	query := h.DB.Where("is_published = ?", true)
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if resourceType != "" {
		query = query.Where("resource_type = ?", resourceType)
	}

	var total int64
	query.Model(&models.Resource{}).Count(&total)

	var resources []models.Resource
	query.Preload("Category").Preload("Uploader").
		Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&resources)

	for i := range resources {
		resources[i].Uploader.Password = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      resources,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func (h *ResourceHandler) GetResourceDetail(c *gin.Context) {
	id := c.Param("id")
	var resource models.Resource
	if err := h.DB.Preload("Category").Preload("Uploader").First(&resource, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "资源不存在"})
		return
	}

	h.DB.Model(&resource).UpdateColumn("view_count", gorm.Expr("view_count + ?", 1))

	resource.Uploader.Password = ""
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": resource})
}

func (h *ResourceHandler) CreateResource(c *gin.Context) {
	var resource models.Resource
	if err := c.ShouldBindJSON(&resource); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	resource.UploaderID = c.GetUint("user_id")
	if err := h.DB.Create(&resource).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": resource, "message": "创建成功"})
}

func (h *ResourceHandler) UpdateResource(c *gin.Context) {
	id := c.Param("id")
	var resource models.Resource
	if err := h.DB.First(&resource, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "资源不存在"})
		return
	}

	if err := c.ShouldBindJSON(&resource); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	h.DB.Model(&resource).Updates(resource)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (h *ResourceHandler) DeleteResource(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Resource{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
