const fs = require('fs');

//console.log('财务数据生成器 - 开始执行...');

try {
  // 计算日期范围
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  // 将日期转换为YYYY-MM-DD格式
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 配置参数
  const config = {
    expensesCount: 30,          // 费用记录数量
    incomesCount: 30,            // 收入记录数量
    goalsCount: 22,              // 目标数量
    amountMinExpense: 10,       // 最小费用金额
    amountMaxExpense: 2000,     // 最大费用金额
    amountMinIncome: 100,       // 最小收入金额
    amountMaxIncome: 10000,     // 最大收入金额
    dateStart: formatDate(oneMonthAgo), // 一个月前的日期
    dateEnd: formatDate(now),   // 当前日期
    decimalChance: 0.7,         // 金额中包含小数的概率(0-1)
    outputFile: 'public/test.json'     // 输出文件名
  };

  //console.log(`日期范围：${config.dateStart} 到 ${config.dateEnd}`);
  //console.log('使用配置:', config);

  // 定义数据模板
  // 费用类别
  const categories = [
    { "id": "food", "name": "餐饮", "icon": "el-icon-food", "color": "#FF9800" },
    { "id": "shopping", "name": "购物", "icon": "el-icon-shopping-bag", "color": "#E91E63" },
    { "id": "housing", "name": "住房", "icon": "el-icon-house", "color": "#673AB7" },
    { "id": "transportation", "name": "交通", "icon": "el-icon-truck", "color": "#2196F3" },
    { "id": "entertainment", "name": "娱乐", "icon": "el-icon-film", "color": "#00BCD4" },
    { "id": "health", "name": "医疗健康", "icon": "el-icon-first-aid-kit", "color": "#4CAF50" },
    { "id": "education", "name": "教育", "icon": "el-icon-reading", "color": "#9C27B0" },
    { "id": "travel", "name": "旅行", "icon": "el-icon-place", "color": "#3F51B5" },
    { "id": "other", "name": "其他", "icon": "el-icon-more", "color": "#9E9E9E" }
  ];

  // 收入类别
  const incomeCategories = [
    { "id": "salary", "name": "工资收入", "icon": "el-icon-money", "color": "#4CAF50" },
    { "id": "bonus", "name": "奖金", "icon": "el-icon-present", "color": "#FF9800" },
    { "id": "investment", "name": "投资收益", "icon": "el-icon-data-line", "color": "#2196F3" },
    { "id": "parttime", "name": "兼职收入", "icon": "el-icon-s-cooperation", "color": "#9C27B0" },
    { "id": "gift", "name": "礼金收入", "icon": "el-icon-box", "color": "#E91E63" },
    { "id": "other", "name": "其他收入", "icon": "el-icon-more", "color": "#607D8B" }
  ];

  // 目标类别
  const goalCategories = [
    { "id": "saving", "name": "储蓄", "icon": "el-icon-money", "color": "#4CAF50" },
    { "id": "investment", "name": "投资", "icon": "el-icon-data-line", "color": "#2196F3" },
    { "id": "travel", "name": "旅行", "icon": "el-icon-place", "color": "#3F51B5" },
    { "id": "shopping", "name": "购物", "icon": "el-icon-shopping-bag", "color": "#E91E63" },
    { "id": "housing", "name": "住房", "icon": "el-icon-house", "color": "#673AB7" },
    { "id": "transportation", "name": "交通", "icon": "el-icon-truck", "color": "#2196F3" },
    { "id": "education", "name": "教育", "icon": "el-icon-reading", "color": "#9C27B0" },
    { "id": "health", "name": "健康", "icon": "el-icon-first-aid-kit", "color": "#4CAF50" },
    { "id": "other", "name": "其他", "icon": "el-icon-more", "color": "#9E9E9E" }
  ];

  // 费用描述映射到类别
  const expenseDescriptionsByCategory = {
    "food": ["超市购物", "外卖", "水果", "餐厅", "早餐", "午餐", "晚餐", "零食", "咖啡", "烘焙"],
    "transportation": ["地铁充值", "打车", "共享单车", "公交卡充值", "停车费", "加油", "高速费", "车辆保养"],
    "housing": ["房租", "水电费", "物业费", "宽带费", "煤气费", "家居用品", "家具", "装修"],
    "entertainment": ["电影院", "游戏充值", "演唱会", "KTV", "展览", "主题公园", "订阅服务", "音乐会"],
    "shopping": ["衣服", "鞋子", "电子产品", "化妆品", "配件", "背包", "手表", "首饰"],
    "health": ["健身房会员", "药品", "医疗保险", "体检", "门诊", "牙医", "眼镜", "保健品"],
    "education": ["书籍", "在线课程", "培训班", "辅导费", "考试费", "文具", "学习软件", "学杂费"],
    "travel": ["机票", "酒店", "签证费", "景点门票", "旅行保险", "行李箱", "旅游装备", "度假套餐"],
    "other": ["礼物", "捐赠", "快递费", "美容", "宠物用品", "维修费", "会员费", "订阅费"]
  };

  // 收入描述映射到类别
  const incomeDescriptionsByCategory = {
    "salary": ["月工资", "周薪", "基本工资", "薪资入账", "工资到账", "月薪"],
    "bonus": ["季度奖金", "年终奖", "绩效奖金", "项目奖金", "销售提成", "节日奖金"],
    "investment": ["股票分红", "基金收益", "利息收入", "债券收益", "理财产品收益", "定期存款利息"],
    "parttime": ["兼职收入", "兼职项目", "自由职业收入", "咨询费", "授课费", "技术服务费"],
    "gift": ["生日红包", "新年红包", "礼金", "奖励金", "赠与", "意外之财"],
    "other": ["退款", "报销款", "保险赔付", "意外所得", "二手物品售卖", "版权收入"]
  };

  // 目标名称映射到类别
  const goalNamesByCategory = {
    "saving": ["紧急备用金", "生活储蓄", "财务自由基金", "养老储蓄", "储蓄计划"],
    "investment": ["投资启动金", "股票投资", "基金定投", "创业资金", "理财目标"],
    "travel": ["旅行基金", "环球旅行", "度假资金", "年度假期", "蜜月旅行"],
    "shopping": ["数码产品升级", "衣橱更新", "家电更新", "奢侈品购买", "节日购物"],
    "housing": ["房屋首付", "家具更新", "家居装修", "搬家资金", "房屋维修"],
    "transportation": ["车辆购置", "汽车保养", "驾照考取", "交通工具", "自行车升级"],
    "education": ["学习基金", "考证费用", "留学储蓄", "技能提升", "学位进修"],
    "health": ["健身计划", "医疗储备", "保险费用", "健康检查", "运动装备"],
    "other": ["结婚基金", "宠物基金", "爱好发展", "慈善捐赠", "意外准备"]
  };

  // 支付方式
  const paymentMethods = ["alipay", "wechat", "credit", "cash", "debit"];
  
  // 收入来源
  const incomeSources = ["salary", "sidejob", "investment", "gift", "refund"];

  // 生成min和max之间的随机数
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 生成随机金额
  function generateAmount(min, max, decimalChance) {
    const whole = getRandomNumber(min, max);
    
    if (Math.random() < decimalChance) {
      const decimal = getRandomNumber(1, 99) / 100;
      return parseFloat((whole + decimal).toFixed(1));
    }
    
    return whole;
  }

  // 生成随机日期
  function generateDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    return formatDate(randomDate);
  }

  // 从数组中获取随机项
  function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // 生成ISO格式的当前时间
  function generateCurrentISODate() {
    return new Date().toISOString();
  }

  // 生成费用数据
  //console.log('生成费用记录...');
  const expenses = [];
  for (let i = 1; i <= config.expensesCount; i++) {
    if (i % 10 === 0) {
      //console.log(`已生成 ${i} 条费用记录...`);
    }
    
    const category = getRandomItem(categories).id;
    const description = getRandomItem(expenseDescriptionsByCategory[category] || ["未知"]);
    
    expenses.push({
      id: String(i),
      amount: generateAmount(config.amountMinExpense, config.amountMaxExpense, config.decimalChance),
      category: category,
      date: generateDate(config.dateStart, config.dateEnd),
      description: description,
      paymentMethod: getRandomItem(paymentMethods)
    });
  }

  // 生成收入数据
  //console.log('生成收入记录...');
  const incomes = [];
  for (let i = 1; i <= config.incomesCount; i++) {
    const category = getRandomItem(incomeCategories).id;
    const description = getRandomItem(incomeDescriptionsByCategory[category] || ["未知"]);
    
    incomes.push({
      id: `inc_${i}`,
      amount: generateAmount(config.amountMinIncome, config.amountMaxIncome, 0.3),
      category: category,
      date: generateDate(config.dateStart, config.dateEnd),
      description: description,
      source: category === "other" ? getRandomItem(incomeSources) : (category === "salary" ? "salary" : getRandomItem(incomeSources))
    });
  }

  // 生成目标数据
  //console.log('生成财务目标...');
  const goals = [];
  for (let i = 1; i <= config.goalsCount; i++) {
    const category = getRandomItem(goalCategories).id;
    const name = getRandomItem(goalNamesByCategory[category] || ["未命名目标"]);
    const targetAmount = generateAmount(5000, 100000, 0);
    const currentAmount = generateAmount(0, targetAmount * 0.8, 0);
    
    // 目标的开始日期和目标日期
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - getRandomNumber(0, 6));
    
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + getRandomNumber(3, 24));
    
    goals.push({
      id: `goal_${i}`,
      name: name,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      startDate: formatDate(startDate),
      targetDate: formatDate(targetDate),
      description: `为${name}储蓄资金`,
      category: category,
      priority: getRandomNumber(1, 5),
      isActive: true,
      color: getRandomItem(goalCategories.filter(g => g.id === category)).color
    });
  }
  
  // 生成预算数据
  //console.log('生成预算数据...');
  const budget = {
    total: 5000 + getRandomNumber(-1000, 2000),
    categoryLimits: {}
  };
  
  // 为每个支出类别设置预算限额
  categories.forEach(category => {
    budget.categoryLimits[category.id] = getRandomNumber(200, 2000);
  });

  // 创建完整的财务数据
  const financialData = {
    expenses: expenses,
    incomes: incomes,
    categories: categories,
    incomeCategories: incomeCategories,
    goals: goals,
    goalCategories: goalCategories,
    budget: budget,
    settings: {
      currency: "CNY",
      language: "zh-CN",
      theme: "light"
    },
    exportDate: generateCurrentISODate()
  };

  //console.log(`准备写入数据到 ${config.outputFile}...`);
  
  // 写入文件
  fs.writeFileSync(config.outputFile, JSON.stringify(financialData, null, 2), 'utf8');
  
  //console.log(`成功生成了完整的财务数据，保存在 ${config.outputFile} 文件中`);
  //console.log(`生成了 ${expenses.length} 条费用记录, ${incomes.length} 条收入记录, ${goals.length} 条目标`);

} catch (error) {
  console.error('脚本执行出错:', error);
}

console.log('数据库初始化完毕');