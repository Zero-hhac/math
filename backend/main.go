package main

import (
	"fmt"
	"log"
	"os"

	"math-association/config"
	"math-association/middleware"
	"math-association/models"
	"math-association/routes"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	cfg := config.Load()

	os.MkdirAll("./data", 0755)
	os.MkdirAll(cfg.UploadDir, 0755)

	db, err := gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Article{},
		&models.Document{},
		&models.Resource{},
		&models.MemberShowcase{},
		&models.SiteConfig{},
		&models.LoginLog{},
		&models.Competition{},
		&models.Contact{},
		&models.Activity{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	seedDatabase(db)
	middleware.InitJWT(cfg.JWTSecret)

	r := routes.Setup(db, cfg.UploadDir)

	addr := fmt.Sprintf("0.0.0.0:%s", cfg.ServerPort)
	log.Printf("🚀 数学协会后端服务启动: http://43.99.48.199:%s", cfg.ServerPort)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func seedDatabase(db *gorm.DB) {
	hashPw := func(pw string) string {
		h, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		return string(h)
	}

	// Super admin
	var adminCount int64
	db.Model(&models.User{}).Where("role = ?", "super_admin").Count(&adminCount)
	if adminCount == 0 {
		db.Create(&models.User{Username: "admin", Password: hashPw("admin123"), Nickname: "超级管理员", Role: "super_admin", Status: 1})
		log.Println("✅ 已创建超级管理员: admin / admin123")
	}

	// Categories
	var catCount int64
	db.Model(&models.Category{}).Count(&catCount)
	if catCount == 0 {
		db.Create([]models.Category{
			{Name: "协会新闻", Slug: "news", Type: "news", SortOrder: 1},
			{Name: "活动通知", Slug: "events", Type: "news", SortOrder: 2},
			{Name: "数学理论", Slug: "theory", Type: "knowledge", SortOrder: 1},
			{Name: "趣味数学", Slug: "fun-math", Type: "knowledge", SortOrder: 2},
			{Name: "竞赛数学", Slug: "competition", Type: "knowledge", SortOrder: 3},
			{Name: "会议纪要", Slug: "meeting-minutes", Type: "document", SortOrder: 1},
			{Name: "协会文件", Slug: "official-docs", Type: "document", SortOrder: 2},
			{Name: "竞赛题库", Slug: "question-bank", Type: "resource", SortOrder: 1},
			{Name: "讲义资料", Slug: "lectures", Type: "resource", SortOrder: 2},
			{Name: "视频教程", Slug: "videos", Type: "resource", SortOrder: 3},
		})
		log.Println("✅ 已创建默认分类")
	}

	// Site config
	var cfgCount int64
	db.Model(&models.SiteConfig{}).Count(&cfgCount)
	if cfgCount == 0 {
		db.Create([]models.SiteConfig{
			{Key: "site_name", Value: "数学协会"},
			{Key: "site_slogan", Value: "探索数学之美，启迪智慧之光"},
			{Key: "site_description", Value: "数学协会官方门户网站，致力于推广数学文化，激发数学兴趣"},
			{Key: "contact_email", Value: "math@university.edu.cn"},
			{Key: "contact_phone", Value: "010-12345678"},
			{Key: "contact_address", Value: "数学系大楼 301 室"},
		})
		log.Println("✅ 已创建站点默认配置")
	}

	// Demo members + showcases
	var memberCount int64
	db.Model(&models.User{}).Where("role = ?", "member").Count(&memberCount)
	if memberCount == 0 {
		members := []models.User{
			{Username: "zhangsan", Password: hashPw("123456"), Nickname: "张三", Email: "zhangsan@math.edu.cn", Phone: "13800001001", Role: "member", Status: 1},
			{Username: "lisi", Password: hashPw("123456"), Nickname: "李四", Email: "lisi@math.edu.cn", Phone: "13800001002", Role: "member", Status: 1},
			{Username: "wangwu", Password: hashPw("123456"), Nickname: "王五", Email: "wangwu@math.edu.cn", Phone: "13800001003", Role: "member", Status: 1},
			{Username: "zhaoliu", Password: hashPw("123456"), Nickname: "赵六", Email: "zhaoliu@math.edu.cn", Phone: "13800001004", Role: "member", Status: 1},
			{Username: "sunqi", Password: hashPw("123456"), Nickname: "孙七", Email: "sunqi@math.edu.cn", Phone: "13800001005", Role: "member", Status: 1},
			{Username: "zhouba", Password: hashPw("123456"), Nickname: "周八", Email: "zhouba@math.edu.cn", Phone: "13800001006", Role: "member", Status: 1},
			{Username: "wujiu", Password: hashPw("123456"), Nickname: "吴九", Email: "wujiu@math.edu.cn", Phone: "13800001007", Role: "member", Status: 1},
			{Username: "zhengshi", Password: hashPw("123456"), Nickname: "郑十", Email: "zhengshi@math.edu.cn", Phone: "13800001008", Role: "member", Status: 1},
		}
		db.Create(&members)
		db.Create([]models.MemberShowcase{
			{UserID: members[0].ID, Bio: "数学分析方向，对实变函数与泛函分析有深入研究。", Achievement: "全国大学生数学竞赛一等奖", Department: "数学科学学院", Grade: "2022级研究生", Skills: "数学分析,泛函分析,实变函数", IsPublic: true, SortOrder: 1},
			{UserID: members[1].ID, Bio: "概率论与数理统计方向，热衷将数学模型应用于实际问题。", Achievement: "美国大学生数学建模竞赛M奖", Department: "统计学院", Grade: "2021级本科生", Skills: "概率论,数理统计,数学建模", IsPublic: true, SortOrder: 2},
			{UserID: members[2].ID, Bio: "代数与数论爱好者，对抽象代数结构有浓厚兴趣。", Achievement: "丘成桐数学竞赛代数方向银奖", Department: "数学科学学院", Grade: "2023级研究生", Skills: "抽象代数,数论,群论", IsPublic: true, SortOrder: 3},
			{UserID: members[3].ID, Bio: "计算数学方向，擅长数值分析与科学计算。", Achievement: "全国研究生数学建模竞赛二等奖", Department: "计算科学系", Grade: "2022级研究生", Skills: "数值分析,科学计算,MATLAB", IsPublic: true, SortOrder: 4},
			{UserID: members[4].ID, Bio: "几何与拓扑方向，对微分几何和代数拓扑有系统学习。", Achievement: "全国大学生数学竞赛二等奖", Department: "数学科学学院", Grade: "2021级本科生", Skills: "微分几何,代数拓扑,流形论", IsPublic: true, SortOrder: 5},
			{UserID: members[5].ID, Bio: "数学教育方向，致力于数学普及与中学竞赛辅导。", Achievement: "优秀学生干部", Department: "教育学部", Grade: "2022级本科生", Skills: "数学教育,竞赛辅导,课程设计", IsPublic: true, SortOrder: 6},
			{UserID: members[6].ID, Bio: "运筹学与控制论方向，对最优化理论有深入研究。", Achievement: "华为杯数学建模竞赛一等奖", Department: "管理科学系", Grade: "2023级研究生", Skills: "运筹学,最优化,线性规划", IsPublic: true, SortOrder: 7},
			{UserID: members[7].ID, Bio: "基础数学方向，对数学哲学与数学史有独特见解。", Achievement: "校级优秀毕业论文", Department: "数学科学学院", Grade: "2020级本科生", Skills: "数学史,数学哲学,基础数学", IsPublic: true, SortOrder: 8},
		})
		log.Println("✅ 已创建8个演示成员及其风采展示")
	}

	// Demo competitions (8 total)
	var compCount int64
	db.Model(&models.Competition{}).Count(&compCount)
	if compCount == 0 {
		db.Create([]models.Competition{
			{Name: "全国大学生数学竞赛", ShortName: "CMC", Organizer: "中国数学会", Time: "每年10月", Frequency: "每年一届", Participants: "大学本科生", Description: "国内规模最大、参与度最高的大学数学竞赛，分数学专业组和非数学专业组。初赛在各赛区举行，决赛每年在不同城市举办。", Difficulty: 4, Icon: "🏆", Category: "国家级竞赛", Tags: `["全国竞赛","数学分析","高等代数","解析几何"]`, Prize: "一等奖、二等奖、三等奖及赛区奖项。决赛获奖者有机会获得推免研究生加分。", PrepTips: "系统复习数学分析、高等代数、解析几何三大基础课。刷历年真题是最高效的备赛方式。", Format: "笔试，3小时，解答题为主"},
			{Name: "美国大学生数学建模竞赛", ShortName: "MCM/ICM", Organizer: "COMAP", Time: "每年2月", Frequency: "每年一届", Participants: "本科生、研究生", Description: "全球最具影响力的数学建模竞赛之一。4天时间内完成从建模、求解、验证到论文撰写的完整流程。", Difficulty: 4, Icon: "🌍", Category: "国际竞赛", Tags: `["数学建模","论文写作","跨学科"]`, Prize: "Outstanding Winner, Finalist, Meritorious Winner, Honorable Mention, Successful Participant。", PrepTips: "提前组队，分工明确（建模、编程、写作）。掌握LaTeX排版，熟练使用MATLAB/Python建模。", Format: "96小时内完成建模论文"},
			{Name: "丘成桐大学生数学竞赛", ShortName: "YCMC", Organizer: "清华大学丘成桐数学科学中心", Time: "每年5-7月", Frequency: "每年一届", Participants: "本科生", Description: "涵盖分析与微分方程、几何与拓扑、代数与数论、应用与计算数学、概率与统计五个方向，检验数学综合能力的高水平竞赛。", Difficulty: 5, Icon: "🎓", Category: "国家级竞赛", Tags: `["综合竞赛","五大方向","精英选拔"]`, Prize: "个人单项金/银/铜奖，团体金/银/铜奖。获奖者可获推荐至世界顶尖大学深造。", PrepTips: "需远超课堂的深度，建议以研究生教材为参考，每个方向精读2-3本经典著作。", Format: "笔试+面试，分方向独立竞赛"},
			{Name: "全国研究生数学建模竞赛", ShortName: "NPMCM", Organizer: "教育部学位与研究生教育发展中心", Time: "每年9月", Frequency: "每年一届", Participants: "研究生", Description: "面向全国研究生的数学建模竞赛，题目贴近工程实际和社会热点，强调模型的创新性和实用性。", Difficulty: 3, Icon: "📊", Category: "国家级竞赛", Tags: `["研究生","数学建模","工程应用"]`, Prize: "一等奖、二等奖、三等奖。", PrepTips: "关注历年赛题，积累建模思路。掌握数据处理和可视化技能。", Format: "4天完成建模与论文"},
			{Name: "阿里巴巴全球数学竞赛", ShortName: "AGMC", Organizer: "阿里巴巴达摩院", Time: "每年4-6月", Frequency: "每年一届", Participants: "无限制，全球均可报名", Description: "以「享受数学之美」为宗旨，题目兼具趣味性与深度，不限年龄学历，全球数学爱好者均可参加。", Difficulty: 5, Icon: "🏅", Category: "国际竞赛", Tags: `["全球竞赛","开放报名","趣味数学"]`, Prize: "金奖5万美元，银奖2万美元，铜奖1万美元，优秀奖5000美元。", PrepTips: "没有固定大纲，考验数学思维的广度。广泛阅读不同分支的经典文献。", Format: "线上预赛+线下决赛"},
			{Name: "全国大学生数学建模竞赛", ShortName: "CUMCM", Organizer: "中国工业与应用数学学会", Time: "每年9月", Frequency: "每年一届", Participants: "本科生", Description: "中国规模最大的数学建模竞赛，每年超5万支队伍参赛。72小时内完成建模、求解和论文撰写。", Difficulty: 3, Icon: "🔢", Category: "国家级竞赛", Tags: `["数学建模","本科生","团队协作"]`, Prize: "全国一等奖、二等奖及赛区奖项。获奖在保研、评优中有重要加分。", PrepTips: "三人组队：建模、编程、写作各一人。MATLAB/Python至少精通一种。多读历年优秀论文。", Format: "72小时团队赛，提交论文"},
			{Name: "ACM-ICPC程序设计竞赛", ShortName: "ICPC", Organizer: "ACM", Time: "区域赛10-12月，总决赛次年", Frequency: "每年一届", Participants: "本科生、研究生", Description: "全球最具影响力的大学生程序设计竞赛，3人团队5小时1台电脑解决10-13道算法题。数论、组合等数学底子至关重要。", Difficulty: 5, Icon: "💻", Category: "国际竞赛", Tags: `["算法","数据结构","数论"]`, Prize: "区域赛金/银/铜奖，全球总决赛奖牌。获奖是进入顶尖科技公司的重要加分项。", PrepTips: "系统学习动态规划、图论、计算几何。在Codeforces/AtCoder持续刷题。", Format: "3人1机，5小时，解答10-13道题"},
			{Name: "全国大学生统计建模竞赛", ShortName: "SMC", Organizer: "中国统计教育学会", Time: "每年3-6月", Frequency: "每年一届", Participants: "本科生、研究生", Description: "强调数据驱动的建模思维，从真实数据出发，运用统计方法进行分析与预测。涉及经济、环境、公共卫生等领域。", Difficulty: 3, Icon: "📈", Category: "国家级竞赛", Tags: `["统计学","数据分析","R语言"]`, Prize: "一等奖、二等奖、三等奖，获奖论文可推荐至统计学期刊发表。", PrepTips: "熟练掌握R/Python数据分析工具链。理解回归分析、时间序列、多元统计等方法。", Format: "提交论文，注重数据分析与模型解释"},
		})
		log.Println("✅ 已创建8个演示竞赛")
	}

	// Demo news
	var newsCount int64
	db.Model(&models.Article{}).Count(&newsCount)
	if newsCount == 0 {
		var admin models.User
		db.Where("role = ?", "super_admin").First(&admin)
		db.Create([]models.Article{
			{Title: "2026年春季数学讨论班正式启动", Content: "本学期数学讨论班将于3月15日正式开始，每周三晚19:00在数学楼303教室举行。本学期主题为「现代分析学导论」，由张教授领衔。\n\n讨论班采用报告+讨论的形式，每位参与者轮流报告一个专题，时长约40分钟，之后进行集体讨论。", Summary: "本学期数学讨论班将于3月15日开始，每周三晚19:00，主题为现代分析学导论。", Type: "news", IsPublished: true, CategoryID: 1, AuthorID: admin.ID, Tags: "讨论班,分析学,学术活动"},
			{Title: "我校在2025年全国大学生数学竞赛中斩获3金5银", Content: "在刚刚结束的2025年全国大学生数学竞赛决赛中，我校数学协会成员表现优异，共获得3枚金牌、5枚银牌和12枚铜牌，创历史最佳成绩。\n\n数学专业组张三同学以满分成绩获得全国第一名。协会指导教师王教授表示，这是协会多年来坚持系统训练的成果。", Summary: "数学协会成员在2025年全国大学生数学竞赛决赛中斩获3金5银12铜，创历史最佳。", Type: "news", IsPublished: true, CategoryID: 1, AuthorID: admin.ID, Tags: "竞赛成果,全国大学生数学竞赛,获奖"},
			{Title: "数学建模经验分享会——从零到一等奖", Content: "本周六下午14:00，协会将举办数学建模经验分享会。邀请三位在全国数学建模竞赛中获得一等奖的学长学姐分享备赛经验和心得体会。\n\n分享内容涵盖：如何组队与分工、建模思路培养、常用软件工具（MATLAB、Python、LaTeX）、论文写作技巧、时间管理策略等。", Summary: "本周六下午14:00举办数学建模经验分享会，三位一等奖获得者分享备赛心得。", Type: "news", IsPublished: true, CategoryID: 2, AuthorID: admin.ID, Tags: "经验分享,数学建模,竞赛"},
			{Title: "2025年秋季「数学之美」系列讲座圆满收官", Content: "历时三个月的秋季讲座系列于上周圆满落幕。本次系列邀请了5位校内外学者，涵盖了拓扑学、数论、微分方程、概率论和数学史共五个主题，累计参与学生超过600人次。\n\n讲座视频已上传至协会资源库，会员可随时回看。", Summary: "2025年秋季「数学之美」系列讲座圆满收官，5场讲座累计参与超600人次。", Type: "news", IsPublished: true, CategoryID: 1, AuthorID: admin.ID, Tags: "讲座,学术活动,拓扑学"},
		})
		log.Println("✅ 已创建4条演示新闻")
	}

	// Demo documents (8 total)
	var docCount int64
	db.Model(&models.Document{}).Count(&docCount)
	if docCount == 0 {
		db.Create([]models.Document{
			{Title: "数学协会章程（2025年修订版）", Description: "数学协会的基本章程，包含协会宗旨、组织架构、会员权利义务等内容。", FilePath: "/uploads/placeholder/charter.pdf", FileSize: 245000, FileType: "PDF", IsPublished: true},
			{Title: "2025年秋季学期工作会议纪要", Description: "2025年9月召开的学期工作会议记录，讨论本学期活动安排、竞赛组织与预算分配。", FilePath: "/uploads/placeholder/meeting-2025-fall.pdf", FileSize: 128000, FileType: "PDF", IsPublished: true},
			{Title: "2024年度协会工作总结报告", Description: "回顾2024年协会在竞赛组织、学术活动、成员发展等方面的成果与不足。", FilePath: "/uploads/placeholder/annual-report-2024.pdf", FileSize: 580000, FileType: "PDF", IsPublished: true},
			{Title: "数学讨论班记录模板", Description: "标准化讨论班记录模板，方便各讨论组统一记录与归档。", FilePath: "/uploads/placeholder/seminar-template.docx", FileSize: 45000, FileType: "DOCX", IsPublished: true},
			{Title: "协会财务报销指南", Description: "协会活动经费报销流程说明，含发票要求、审批流程、报销时限等。", FilePath: "/uploads/placeholder/finance-guide.pdf", FileSize: 96000, FileType: "PDF", IsPublished: true},
			{Title: "新成员入会指南", Description: "帮助新成员快速了解协会文化、活动安排、资源获取方式和参与途径。", FilePath: "/uploads/placeholder/member-guide.pdf", FileSize: 172000, FileType: "PDF", IsPublished: true},
			{Title: "竞赛备赛攻略手册", Description: "汇总历年竞赛经验，包含时间规划、推荐书目、模拟训练方法等。", FilePath: "/uploads/placeholder/competition-prep.pdf", FileSize: 320000, FileType: "PDF", IsPublished: true},
			{Title: "学术活动策划模板", Description: "举办讲座、讨论班、工作坊等学术活动的标准流程与策划模板。", FilePath: "/uploads/placeholder/event-template.docx", FileSize: 68000, FileType: "DOCX", IsPublished: true},
		})
		log.Println("✅ 已创建8个演示文档")
	}

	// Demo resources (10 total)
	var resCount int64
	db.Model(&models.Resource{}).Count(&resCount)
	if resCount == 0 {
		db.Create([]models.Resource{
			{Title: "高等代数经典习题精选200题", Description: "精选高等代数核心习题200道，涵盖矩阵、线性空间、线性变换、特征值、二次型等章节。附详细解答。", Content: "从矩阵基础到Jordan标准型，难度循序渐进。适合准备全国大学生数学竞赛和期末复习。", ResourceType: "question_bank", Difficulty: 3, IsPublished: true},
			{Title: "数学分析考研讲义（上）", Description: "覆盖极限、连续、导数、积分等核心内容。包含知识点总结、典型例题和历年真题分析。", Content: "第一篇：极限论与连续函数\n第二篇：一元函数微分学\n第三篇：一元函数积分学\n第四篇：级数理论", ResourceType: "lecture", Difficulty: 4, IsPublished: true},
			{Title: "数学建模入门：从问题到模型", Description: "适合建模新手的入门教程，通过12个经典案例讲解数学建模的基本方法和流程。", Content: "第一章：什么是数学建模\n第二章：初等模型\n第三章：微分方程模型\n第四章：概率模型\n第五章：优化模型", ResourceType: "lecture", Difficulty: 2, IsPublished: true},
			{Title: "线性代数可视化教程（视频）", Description: "通过几何直观的可视化讲解线代核心概念，让抽象变得具体。含12个主题视频。", Content: "视频目录：向量空间、矩阵乘法、行列式几何意义、特征值与特征向量、奇异值分解……", ResourceType: "video", Difficulty: 2, IsPublished: true},
			{Title: "概率论与数理统计核心讲义", Description: "整合概率论与数理统计核心知识点，附经典例题和考研真题解析。", Content: "上篇：概率论基础（随机事件、随机变量、数字特征、大数定律）\n下篇：数理统计（抽样分布、参数估计、假设检验、回归分析）", ResourceType: "lecture", Difficulty: 3, IsPublished: true},
			{Title: "考研数学一真题精解（2018-2025）", Description: "收录8年考研数学一真题，每道题附详细解答与考点分析。", Content: "按高等数学、线性代数、概率统计三个模块编排，方便针对性训练。", ResourceType: "book", Difficulty: 4, IsPublished: true},
			{Title: "实变函数核心讲义", Description: "覆盖测度论、可测函数、Lebesgue积分等核心内容，适合研究生入门和本科生提高。", Content: "第一章：集合与测度\n第二章：可测函数\n第三章：Lebesgue积分\n第四章：微分与积分", ResourceType: "lecture", Difficulty: 5, IsPublished: true},
			{Title: "常微分方程习题精选150题", Description: "精选ODE经典习题150道，涵盖一阶方程、高阶线性方程、方程组、稳定性理论等。", Content: "每道题附详细解答，部分题目提供多种解法对比。适合期末复习和考研备考。", ResourceType: "question_bank", Difficulty: 3, IsPublished: true},
			{Title: "Python数学建模实战教程", Description: "从零开始用Python解决数学建模问题，包含数据预处理、模型构建与可视化。", Content: "第一章：Python科学计算环境\n第二章：数据处理与可视化\n第三章：优化模型实现\n第四章：统计模型与机器学习入门", ResourceType: "lecture", Difficulty: 2, IsPublished: true},
			{Title: "拓扑学入门讲义", Description: "点集拓扑学基础讲义，从开集与连续映射开始，逐步引入紧致性与连通性。", Content: "第一章：拓扑空间与连续映射\n第二章：积空间与商空间\n第三章：紧致性\n第四章：连通性与道路连通性", ResourceType: "lecture", Difficulty: 5, IsPublished: true},
		})
		log.Println("✅ 已创建10个演示学习资源")
	}

	// Demo activities
	var activityCount int64
	db.Model(&models.Activity{}).Count(&activityCount)
	if activityCount == 0 {
		db.Create([]models.Activity{
			{Title: "专题讲座", Description: "邀请老师、获奖成员与校友拆解具体题型、方法论与赛道选择。", Period: "每月一次", Icon: "🎤", SortOrder: 1, IsPublished: true, Visibility: "public"},
			{Title: "讨论班", Description: "围绕一个主题连续推进，让证明、反例与表达能力一起变清晰。", Period: "每周进行", Icon: "💬", SortOrder: 2, IsPublished: true, Visibility: "public"},
			{Title: "建模实训", Description: "从问题理解到论文成型，训练跨工具、跨角色的协作能力。", Period: "学期重点项目", Icon: "📐", SortOrder: 3, IsPublished: true, Visibility: "both"},
			{Title: "课程支持", Description: "帮助低年级同学建立基础，不让\u201c听不懂\u201d变成长期挫败。", Period: "期中与期末", Icon: "📖", SortOrder: 4, IsPublished: true, Visibility: "public"},
		})
		log.Println("✅ 已创建4个演示活动")
	}
}
