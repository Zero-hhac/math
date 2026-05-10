package handlers

import (
	"math-association/models"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ArticleHandler struct {
	DB *gorm.DB
}

// GetPublicArticles returns published articles for public viewing
func (h *ArticleHandler) GetPublicArticles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	articleType := c.DefaultQuery("type", "news") // news or knowledge
	categoryID := c.Query("category_id")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}

	query := h.DB.Where("is_published = ? AND (visibility = ? OR visibility = ?)", true, "public", "both").
		Where("publish_at IS NULL OR publish_at <= ?", time.Now())
	if articleType != "" {
		query = query.Where("type = ?", articleType)
	}
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	var total int64
	query.Model(&models.Article{}).Count(&total)

	var articles []models.Article
	query.Preload("Category").Preload("Author").
		Order("is_pinned DESC, created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&articles)

	// Strip password from author
	for i := range articles {
		articles[i].Author.Password = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      articles,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func (h *ArticleHandler) GetArticleDetail(c *gin.Context) {
	id := c.Param("id")
	var article models.Article
	if err := h.DB.Preload("Category").Preload("Author").First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "文章不存在"})
		return
	}

	// Increment view count
	h.DB.Model(&article).UpdateColumn("view_count", gorm.Expr("view_count + ?", 1))

	article.Author.Password = ""
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": article})
}

// GetAllArticles for admin - includes unpublished
func (h *ArticleHandler) GetAllArticles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	articleType := c.Query("type")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	query := h.DB.Model(&models.Article{})
	if articleType != "" {
		query = query.Where("type = ?", articleType)
	}

	var total int64
	query.Count(&total)

	var articles []models.Article
	query.Preload("Category").Preload("Author").
		Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&articles)

	for i := range articles {
		articles[i].Author.Password = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      articles,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func (h *ArticleHandler) CreateArticle(c *gin.Context) {
	var article models.Article
	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	article.AuthorID = c.GetUint("user_id")
	if article.Slug == "" {
		article.Slug = generateSlug(article.Title)
	}
	if article.Tags != "" {
		article.Tags = strings.TrimSpace(article.Tags)
	}

	if err := h.DB.Create(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": article, "message": "创建成功"})
}

func (h *ArticleHandler) UpdateArticle(c *gin.Context) {
	id := c.Param("id")
	var article models.Article
	if err := h.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "文章不存在"})
		return
	}

	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}

	h.DB.Model(&article).Updates(article)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (h *ArticleHandler) DeleteArticle(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Article{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func (h *ArticleHandler) GetCategories(c *gin.Context) {
	categoryType := c.Query("type")
	var categories []models.Category

	query := h.DB.Model(&models.Category{})
	if categoryType != "" {
		query = query.Where("type = ?", categoryType)
	}
	query.Order("sort_order ASC").Find(&categories)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": categories})
}

func (h *ArticleHandler) CreateCategory(c *gin.Context) {
	var category models.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "请求参数错误"})
		return
	}
	if err := h.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": category, "message": "创建成功"})
}

func generateSlug(title string) string {
	return strings.ToLower(strings.ReplaceAll(title, " ", "-"))
}
