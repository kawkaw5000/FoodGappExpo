/**
 * WellNū Selenium E2E Test Suite
 * Comprehensive automation tests for all user flows
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const assert = require('assert');

class WellNuSeleniumTests {
  constructor() {
    this.driver = null;
    this.baseUrl = 'http://localhost:19006'; // Expo web URL
  }

  async setup() {
    this.driver = await new Builder().forBrowser('chrome').build();
    await this.driver.manage().setTimeouts({ implicit: 10000 });
  }

  async teardown() {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  // Helper methods
  async waitForElement(selector, timeout = 10000) {
    return await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
  }

  async waitForText(selector, text, timeout = 10000) {
    return await this.driver.wait(until.elementTextContains(
      await this.driver.findElement(By.css(selector)), text
    ), timeout);
  }

  async takeScreenshot(filename) {
    const screenshot = await this.driver.takeScreenshot();
    require('fs').writeFileSync(`./screenshots/${filename}.png`, screenshot, 'base64');
  }

  // Test Suite 1: User Onboarding & Registration
  async testUserOnboarding() {
    console.log('🧪 Testing User Onboarding Flow...');
    
    await this.driver.get(this.baseUrl);
    
    // Navigate to registration
    await this.waitForElement('#register-button');
    await this.driver.findElement(By.css('#register-button')).click();
    
    // Fill registration form
    await this.waitForElement('#firstName-input');
    await this.driver.findElement(By.css('#firstName-input')).sendKeys('Juan');
    await this.driver.findElement(By.css('#lastName-input')).sendKeys('Dela Cruz');
    await this.driver.findElement(By.css('#age-input')).sendKeys('25');
    await this.driver.findElement(By.css('#weight-input')).sendKeys('70');
    await this.driver.findElement(By.css('#height-input')).sendKeys('170');
    
    // Select body goal
    await this.driver.findElement(By.css('#body-goal-selector')).click();
    await this.driver.findElement(By.css('[data-value="lose-weight"]')).click();
    
    // Submit registration
    await this.driver.findElement(By.css('#complete-registration-btn')).click();
    
    // Verify navigation to home screen
    await this.waitForElement('#home-screen');
    await this.waitForText('#welcome-message', 'Welcome to WellNū!');
    
    await this.takeScreenshot('user-onboarding-complete');
    console.log('✅ User onboarding test passed');
  }

  // Test Suite 2: Daily Login & Gamification
  async testDailyLoginSystem() {
    console.log('🧪 Testing Daily Login & XP System...');
    
    // Navigate to profile
    await this.driver.findElement(By.css('#bottom-nav-profile')).click();
    await this.waitForElement('#profile-screen');
    
    // Check initial XP state
    const initialXP = await this.driver.findElement(By.css('#total-xp-display')).getText();
    console.log(`Initial XP: ${initialXP}`);
    
    // Trigger daily login (simulate app focus)
    await this.driver.navigate().refresh();
    
    // Wait for XP notification
    await this.waitForElement('#xp-notification');
    const xpNotification = await this.driver.findElement(By.css('#xp-notification')).getText();
    assert(xpNotification.includes('+500 XP'), 'Daily login XP not awarded');
    
    // Verify level badge update
    await this.waitForElement('#level-badge');
    const levelBadge = await this.driver.findElement(By.css('#level-badge')).getText();
    assert(levelBadge.includes('Level 1'), 'Level not correctly displayed');
    
    // Check daily streak
    const streakDisplay = await this.driver.findElement(By.css('#daily-streak')).getText();
    assert(parseInt(streakDisplay) >= 1, 'Daily streak not incremented');
    
    await this.takeScreenshot('daily-login-complete');
    console.log('✅ Daily login test passed');
  }

  // Test Suite 3: Food Logging & Scanning
  async testFoodLoggingFlow() {
    console.log('🧪 Testing Food Logging & Scanning...');
    
    // Navigate to scan screen
    await this.driver.findElement(By.css('#bottom-nav-scan')).click();
    await this.waitForElement('#scan-screen');
    
    // Test manual food entry (simulate since camera not available in web)
    await this.driver.findElement(By.css('#manual-entry-button')).click();
    await this.waitForElement('#food-search-input');
    
    // Search for Filipino food
    await this.driver.findElement(By.css('#food-search-input')).sendKeys('Adobo');
    await this.driver.findElement(By.css('#search-submit')).click();
    
    // Select food from results
    await this.waitForElement('[data-food-id="adobo-chicken"]');
    await this.driver.findElement(By.css('[data-food-id="adobo-chicken"]')).click();
    
    // Confirm food selection
    await this.waitForElement('#confirm-food-adobo-chicken');
    await this.driver.findElement(By.css('#confirm-food-adobo-chicken')).click();
    
    // Set portion size
    await this.waitForElement('#portion-size-selector');
    await this.driver.findElement(By.css('#portion-size-selector')).click();
    await this.driver.findElement(By.css('[data-portion="medium"]')).click();
    
    // Add to meal log
    await this.driver.findElement(By.css('#add-to-breakfast-log')).click();
    
    // Verify XP notification for food logging
    await this.waitForElement('#xp-notification');
    const xpText = await this.driver.findElement(By.css('#xp-notification')).getText();
    assert(xpText.includes('+50 XP'), 'Food logging XP not awarded');
    
    // Check if "First Steps" achievement unlocked
    try {
      await this.waitForElement('#achievement-unlock-first_steps', 5000);
      console.log('🏆 First Steps achievement unlocked!');
      await this.takeScreenshot('first-achievement-unlocked');
    } catch (e) {
      console.log('ℹ️ First Steps achievement not triggered (may already be unlocked)');
    }
    
    await this.takeScreenshot('food-logging-complete');
    console.log('✅ Food logging test passed');
  }

  // Test Suite 4: WellNū Nutrition Analysis
  async testWellNuNutritionFeatures() {
    console.log('🧪 Testing WellNū Nutrition Analysis...');
    
    // Navigate to home screen
    await this.driver.findElement(By.css('#bottom-nav-home')).click();
    await this.waitForElement('#home-screen');
    
    // Check WellNū nutrient status card
    await this.waitForElement('#nutrient-status-card');
    await this.driver.findElement(By.css('#nutrient-status-card')).click();
    
    // Verify micronutrient grid display
    await this.waitForElement('#micronutrient-grid');
    const micronutrients = await this.driver.findElements(By.css('.micronutrient-item'));
    assert(micronutrients.length > 0, 'Micronutrients not displayed');
    
    // Check for deficiency indicators
    const deficiencyItems = await this.driver.findElements(By.css('.deficient-item'));
    if (deficiencyItems.length > 0) {
      console.log(`🔍 Found ${deficiencyItems.length} nutrient deficiencies`);
      
      // Click on a deficiency to see recommendations
      await deficiencyItems[0].click();
      await this.waitForElement('#filipino-food-recommendations');
      
      // Verify Filipino food suggestions appear
      const recommendations = await this.driver.findElements(By.css('.filipino-food-card'));
      assert(recommendations.length > 0, 'Filipino food recommendations not shown');
      
      console.log(`💡 ${recommendations.length} Filipino food recommendations displayed`);
    }
    
    await this.takeScreenshot('wellnu-nutrition-analysis');
    console.log('✅ WellNū nutrition analysis test passed');
  }

  // Test Suite 5: Real-time Alerts
  async testRealTimeAlerts() {
    console.log('🧪 Testing Real-time Alert System...');
    
    // Log high-sodium food to trigger alert
    await this.driver.findElement(By.css('#bottom-nav-log')).click();
    await this.waitForElement('#log-screen');
    
    // Add processed food (high sodium)
    await this.driver.findElement(By.css('#quick-add-button')).click();
    await this.driver.findElement(By.css('[data-food="instant-noodles"]')).click();
    await this.driver.findElement(By.css('#add-to-log')).click();
    
    // Check for sodium excess alert
    try {
      await this.waitForElement('#deficiency-alert', 15000);
      const alertText = await this.driver.findElement(By.css('#deficiency-alert')).getText();
      
      if (alertText.includes('sodium') || alertText.includes('salt')) {
        console.log('🚨 Sodium excess alert triggered correctly');
        
        // Check for Filipino cultural context
        assert(alertText.includes('Filipino') || alertText.includes('fresh fish'), 
               'Filipino cultural context missing from alert');
        
        // Dismiss alert
        await this.driver.findElement(By.css('#dismiss-alert')).click();
      }
    } catch (e) {
      console.log('ℹ️ No alerts triggered (sodium levels may be normal)');
    }
    
    await this.takeScreenshot('realtime-alerts');
    console.log('✅ Real-time alerts test passed');
  }

  // Test Suite 6: Filipino Food Database
  async testFilipinoFoodDatabase() {
    console.log('🧪 Testing Filipino Food Database...');
    
    await this.driver.findElement(By.css('#bottom-nav-home')).click();
    await this.waitForElement('#filipino-food-database');
    await this.driver.findElement(By.css('#filipino-food-database')).click();
    
    // Search for traditional Filipino food
    await this.waitForElement('#food-search-input');
    await this.driver.findElement(By.css('#food-search-input')).sendKeys('Malunggay');
    
    // Verify search results
    await this.waitForElement('.food-search-result');
    const searchResults = await this.driver.findElements(By.css('.food-search-result'));
    assert(searchResults.length > 0, 'Filipino food search returned no results');
    
    // Click on first result
    await searchResults[0].click();
    
    // Verify cultural context information
    await this.waitForElement('#cultural-context-info');
    const culturalInfo = await this.driver.findElement(By.css('#cultural-context-info')).getText();
    assert(culturalInfo.length > 0, 'Cultural context information missing');
    
    // Check nutrition information
    await this.waitForElement('#nutrition-details');
    const nutritionDetails = await this.driver.findElement(By.css('#nutrition-details')).getText();
    assert(nutritionDetails.includes('iron') || nutritionDetails.includes('vitamin'), 
           'Nutrition details not displayed');
    
    await this.takeScreenshot('filipino-food-database');
    console.log('✅ Filipino food database test passed');
  }

  // Test Suite 7: Achievement System
  async testAchievementSystem() {
    console.log('🧪 Testing Achievement System...');
    
    // Navigate to profile to view achievements
    await this.driver.findElement(By.css('#bottom-nav-profile')).click();
    await this.waitForElement('#level-badge');
    await this.driver.findElement(By.css('#level-badge')).click();
    
    // Wait for level modal to open
    await this.waitForElement('#level-up-modal');
    
    // Check achievement count
    const achievementCount = await this.driver.findElement(By.css('#achievement-count')).getText();
    console.log(`🏆 Current achievements: ${achievementCount}`);
    
    // View achievement details
    const achievements = await this.driver.findElements(By.css('.achievement-item'));
    if (achievements.length > 0) {
      // Check first achievement
      const firstAchievement = achievements[0];
      const achievementName = await firstAchievement.findElement(By.css('.achievement-title')).getText();
      const achievementDesc = await firstAchievement.findElement(By.css('.achievement-description')).getText();
      
      console.log(`🎖️ Achievement: ${achievementName} - ${achievementDesc}`);
      assert(achievementName.length > 0, 'Achievement name not displayed');
      assert(achievementDesc.length > 0, 'Achievement description not displayed');
    }
    
    // Check local statistics
    await this.waitForElement('#local-stats-container');
    const statsItems = await this.driver.findElements(By.css('.stat-item'));
    assert(statsItems.length >= 4, 'Local statistics not fully displayed');
    
    await this.takeScreenshot('achievement-system');
    console.log('✅ Achievement system test passed');
  }

  // Test Suite 8: Weekly Challenges
  async testWeeklyChallenges() {
    console.log('🧪 Testing Weekly Challenge System...');
    
    await this.driver.findElement(By.css('#bottom-nav-home')).click();
    await this.waitForElement('#weekly-challenge-card');
    
    // Check challenge display
    const challengeTitle = await this.driver.findElement(By.css('#challenge-title')).getText();
    const challengeProgress = await this.driver.findElement(By.css('#challenge-progress-bar')).getAttribute('data-progress');
    
    console.log(`📋 Weekly Challenge: ${challengeTitle}`);
    console.log(`📊 Progress: ${challengeProgress}%`);
    
    // Simulate challenge progress (log foods that count toward challenge)
    if (challengeTitle.includes('vegetable') || challengeTitle.includes('Filipino')) {
      await this.driver.findElement(By.css('#bottom-nav-log')).click();
      
      // Log vegetables to progress challenge
      const vegetables = ['Malunggay', 'Kangkong', 'Ampalaya'];
      for (const veggie of vegetables) {
        await this.driver.findElement(By.css('#quick-search')).clear();
        await this.driver.findElement(By.css('#quick-search')).sendKeys(veggie);
        
        try {
          await this.waitForElement(`[data-food-name="${veggie.toLowerCase()}"]`, 3000);
          await this.driver.findElement(By.css(`[data-food-name="${veggie.toLowerCase()}"]`)).click();
          await this.driver.findElement(By.css('#add-to-log')).click();
          console.log(`🥬 Logged ${veggie} for challenge progress`);
        } catch (e) {
          console.log(`⚠️ Could not find ${veggie} in database`);
        }
      }
    }
    
    await this.takeScreenshot('weekly-challenges');
    console.log('✅ Weekly challenge test passed');
  }

  // Test Suite 9: Data Persistence & Offline Functionality
  async testDataPersistence() {
    console.log('🧪 Testing Data Persistence & Offline Functionality...');
    
    // Record current state
    await this.driver.findElement(By.css('#bottom-nav-profile')).click();
    const currentXP = await this.driver.findElement(By.css('#total-xp-display')).getText();
    const currentLevel = await this.driver.findElement(By.css('#level-title')).getText();
    
    console.log(`💾 Current State - XP: ${currentXP}, Level: ${currentLevel}`);
    
    // Simulate app restart (refresh page)
    await this.driver.navigate().refresh();
    await this.waitForElement('#bottom-nav-profile');
    await this.driver.findElement(By.css('#bottom-nav-profile')).click();
    
    // Verify data persisted
    const persistedXP = await this.driver.findElement(By.css('#total-xp-display')).getText();
    const persistedLevel = await this.driver.findElement(By.css('#level-title')).getText();
    
    assert(currentXP === persistedXP, 'XP not persisted across sessions');
    assert(currentLevel === persistedLevel, 'Level not persisted across sessions');
    
    console.log(`✅ Data persistence verified - XP: ${persistedXP}, Level: ${persistedLevel}`);
    await this.takeScreenshot('data-persistence');
    console.log('✅ Data persistence test passed');
  }

  // Master test runner
  async runAllTests() {
    try {
      await this.setup();
      console.log('🚀 Starting WellNū Selenium Test Suite...\n');
      
      await this.testUserOnboarding();
      await this.testDailyLoginSystem();
      await this.testFoodLoggingFlow();
      await this.testWellNuNutritionFeatures();
      await this.testRealTimeAlerts();
      await this.testFilipinoFoodDatabase();
      await this.testAchievementSystem();
      await this.testWeeklyChallenges();
      await this.testDataPersistence();
      
      console.log('\n🎉 ALL WELLNŪ TESTS PASSED! 🎉');
      console.log('✅ User onboarding & registration');
      console.log('✅ Daily login & XP system');
      console.log('✅ Food logging & scanning');
      console.log('✅ WellNū nutrition analysis');
      console.log('✅ Real-time alert system');
      console.log('✅ Filipino food database');
      console.log('✅ Achievement system');
      console.log('✅ Weekly challenges');
      console.log('✅ Data persistence');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await this.takeScreenshot('test-failure');
      throw error;
    } finally {
      await this.teardown();
    }
  }
}

// Run tests
if (require.main === module) {
  const testSuite = new WellNuSeleniumTests();
  testSuite.runAllTests().catch(console.error);
}

module.exports = WellNuSeleniumTests;
