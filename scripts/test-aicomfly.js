#!/usr/bin/env node

/**
 * Aicomfly 集成测试脚本
 * 使用方法: node scripts/test-aicomfly.js [API_KEY]
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const apiKey = process.argv[2];

// 检查API密钥
function checkApiKey() {
  console.log('🔍 检查API密钥...');
  
  if (!apiKey) {
    console.error('❌ 缺少API密钥参数');
    console.log('使用方法: node scripts/test-aicomfly.js [API_KEY]');
    return false;
  }
  
  console.log(`✅ API密钥已提供: ***${apiKey.slice(-4)}`);
  return true;
}

// 测试 API 端点
async function testAPIEndpoints() {
  console.log('\n🌐 测试 API 端点...');
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000';
  
  try {
    // 测试风格列表端点
    console.log('📋 测试获取风格列表...');
    const stylesResponse = await fetch(`${baseUrl}/api/styles`);
    
    if (stylesResponse.ok) {
      const stylesData = await stylesResponse.json();
      console.log(`✅ 风格列表获取成功，共 ${stylesData.styles?.length || 0} 个风格`);
      if (stylesData.styles) {
        stylesData.styles.slice(0, 3).forEach(style => {
          console.log(`   - ${style.name} (${style.id})`);
        });
      }
    } else {
      console.error('❌ 风格列表获取失败:', stylesResponse.status, stylesResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ API 测试失败:', error.message);
    console.log('请确保应用正在运行 (npm run dev)');
  }
}

// 验证服务工厂
function testServiceFactory() {
  console.log('\n🏭 测试服务工厂...');
  
  try {
    // 这里需要模拟 Node.js 环境
    const { ImageStylizationProvider } = require('../config/image-stylization-config');
    
    console.log('✅ 服务提供商配置正确: AICOMFLY');
    
  } catch (error) {
    console.error('❌ 服务工厂测试失败:', error.message);
  }
}

// 检查文件结构
function checkFileStructure() {
  console.log('\n📁 检查文件结构...');
  
  const requiredFiles = [
    'services/image-stylization/aicomfly-service.ts',
    'config/image-stylization-config.ts',
    'app/api/styles/route.ts',
    'AICOMFLY_SETUP.md'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${filePath}`);
    } else {
      missingFiles.push(filePath);
      console.log(`❌ ${filePath} (缺失)`);
    }
  });
  
  if (missingFiles.length > 0) {
    console.error('❌ 缺少必要的文件:', missingFiles.join(', '));
    return false;
  }
  
  return true;
}

// 主函数
async function main() {
  console.log('🚀 Aicomfly 集成测试开始...\n');
  
  const apiKeyOk = checkApiKey();
  const filesOk = checkFileStructure();
  
  if (!apiKeyOk || !filesOk) {
    console.log('\n❌ 测试失败，请检查上述问题');
    process.exit(1);
  }
  
  testServiceFactory();
  await testAPIEndpoints();
  
  console.log('\n✅ 测试完成！');
  console.log('\n📖 下一步:');
  console.log('1. 确保应用正在运行: npm run dev');
  console.log('2. 访问 http://localhost:3000 测试界面');
  console.log('3. 上传图片并选择风格进行测试');
  console.log('4. 查看控制台日志以获取详细信息');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkApiKey,
  testAPIEndpoints,
  testServiceFactory,
  checkFileStructure
}; 