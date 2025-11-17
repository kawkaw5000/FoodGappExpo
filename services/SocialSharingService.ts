import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import { Alert, Linking } from 'react-native';

export interface ShareData {
  calories: number;
  goal: number;
  remaining: number;
  protein: number;
  fats: number;
  carbs: number;
  date: string;
  userName?: string;
  level?: number;
  badge?: string;
}

class SocialSharingService {
  // Share an image file using expo-sharing
  static async shareImageGeneric(imageUri: string): Promise<boolean> {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your FoodGapp progress',
        });
        return true;
      } else {
        Alert.alert('Sharing not available', 'Cannot share image on this device.');
        return false;
      }
    } catch (error) {
      console.error('Image sharing error:', error);
      Alert.alert('Error', 'Could not share your progress image. Please try again.');
      return false;
    }
  }
  
  private static generateShareText(data: ShareData): string {
    const { calories, goal, remaining, protein, fats, carbs, date, userName, level, badge } = data;
    
    return `🍎 My FoodGapp Progress - ${date} 🍎

${userName ? `👤 ${userName}` : ''}${level ? ` • Level ${level} ${badge || '⭐'}` : ''}

📊 Daily Summary:
• Consumed: ${calories} cal
• Goal: ${goal} kcal  
• Remaining: ${remaining} kcal

🥗 Macros:
• Protein: ${protein}g
• Fats: ${fats}g
• Carbs: ${carbs}g

#FoodGapp #HealthyEating #FitnessJourney #NutritionTracking`;
  }

  private static generateHashtags(): string {
    return '#FoodGapp #HealthyEating #FitnessJourney #NutritionTracking #HealthyLifestyle #CalorieCounter #MacroTracking #WellnessWednesday #HealthGoals #FoodDiary';
  }

  // Facebook Sharing
  static async shareToFacebook(data: ShareData): Promise<boolean> {
    try {
      const shareText = this.generateShareText(data);
      const encodedText = encodeURIComponent(shareText);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://foodgapp.com&quote=${encodedText}`;
      
      const canOpen = await Linking.canOpenURL(facebookUrl);
      if (canOpen) {
        await Linking.openURL(facebookUrl);
        return true;
      } else {
        throw new Error('Facebook app not available');
      }
    } catch (error) {
      console.error('Facebook sharing error:', error);
      Alert.alert('Error', 'Could not share to Facebook. Please make sure the Facebook app is installed.');
      return false;
    }
  }

  // Twitter/X Sharing
  static async shareToTwitter(data: ShareData): Promise<boolean> {
    try {
      const shareText = this.generateShareText(data);
      const hashtags = this.generateHashtags();
      const encodedText = encodeURIComponent(`${shareText}\n\n${hashtags}`);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
      
      const canOpen = await Linking.canOpenURL(twitterUrl);
      if (canOpen) {
        await Linking.openURL(twitterUrl);
        return true;
      } else {
        throw new Error('Twitter app not available');
      }
    } catch (error) {
      console.error('Twitter sharing error:', error);
      Alert.alert('Error', 'Could not share to Twitter. Please make sure the Twitter app is installed.');
      return false;
    }
  }

  // Instagram Story Sharing
  static async shareToInstagram(data: ShareData): Promise<boolean> {
    try {
      // For Instagram, we'll copy text to clipboard and open Instagram
      const shareText = this.generateShareText(data);
      await Clipboard.setStringAsync(shareText);
      
      const instagramUrl = 'instagram://story-camera';
      const canOpen = await Linking.canOpenURL(instagramUrl);
      
      if (canOpen) {
        await Linking.openURL(instagramUrl);
        Alert.alert(
          'Instagram Opened', 
          'Your progress text has been copied to clipboard. Paste it in your Instagram story!',
          [{ text: 'OK' }]
        );
        return true;
      } else {
        throw new Error('Instagram app not available');
      }
    } catch (error) {
      console.error('Instagram sharing error:', error);
      Alert.alert('Error', 'Could not open Instagram. Please make sure the Instagram app is installed.');
      return false;
    }
  }

  // WhatsApp Sharing
  static async shareToWhatsApp(data: ShareData): Promise<boolean> {
    try {
      const shareText = this.generateShareText(data);
      const encodedText = encodeURIComponent(shareText);
      const whatsappUrl = `whatsapp://send?text=${encodedText}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        throw new Error('WhatsApp app not available');
      }
    } catch (error) {
      console.error('WhatsApp sharing error:', error);
      Alert.alert('Error', 'Could not share to WhatsApp. Please make sure WhatsApp is installed.');
      return false;
    }
  }

  // LinkedIn Sharing
  static async shareToLinkedIn(data: ShareData): Promise<boolean> {
    try {
      const shareText = this.generateShareText(data);
      const encodedText = encodeURIComponent(shareText);
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://foodgapp.com&text=${encodedText}`;
      
      const canOpen = await Linking.canOpenURL(linkedinUrl);
      if (canOpen) {
        await Linking.openURL(linkedinUrl);
        return true;
      } else {
        throw new Error('LinkedIn app not available');
      }
    } catch (error) {
      console.error('LinkedIn sharing error:', error);
      Alert.alert('Error', 'Could not share to LinkedIn. Please make sure the LinkedIn app is installed.');
      return false;
    }
  }

  // Generic system share
  static async shareGeneric(data: ShareData): Promise<boolean> {
    try {
      const shareText = this.generateShareText(data);
      
      if (await Sharing.isAvailableAsync()) {
        // Create a temporary text file
  const fileUri = 'file:///tmp/foodgapp_progress.txt';
        await FileSystem.writeAsStringAsync(fileUri, shareText);

        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share your FoodGapp progress',
        });

        // Clean up the temporary file
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        return true;
      } else {
        // Fallback to clipboard
        await Clipboard.setStringAsync(shareText);
        Alert.alert(
          'Text Copied', 
          'Your progress has been copied to clipboard. You can now paste it anywhere!',
          [{ text: 'OK' }]
        );
        return true;
      }
    } catch (error) {
      console.error('Generic sharing error:', error);
      Alert.alert('Error', 'Could not share your progress. Please try again.');
      return false;
    }
  }

  // Copy to clipboard
  static async copyToClipboard(data: ShareData): Promise<boolean> {
    try {
      const shareText = this.generateShareText(data);
      await Clipboard.setStringAsync(shareText);
      Alert.alert('Copied!', 'Your progress has been copied to clipboard.');
      return true;
    } catch (error) {
      console.error('Clipboard error:', error);
      Alert.alert('Error', 'Could not copy to clipboard.');
      return false;
    }
  }

  // Create shareable image (for future implementation)
  static async createShareableImage(data: ShareData): Promise<string | null> {
    // This would require a library like react-native-view-shot
    // For now, we'll return null and implement later if needed
    return null;
  }

  // Get available sharing platforms
  static async getAvailablePlatforms(): Promise<string[]> {
    const platforms: string[] = [];
    
    try {
      if (await Linking.canOpenURL('https://www.facebook.com')) platforms.push('facebook');
      if (await Linking.canOpenURL('https://twitter.com')) platforms.push('twitter');
      if (await Linking.canOpenURL('instagram://app')) platforms.push('instagram');
      if (await Linking.canOpenURL('whatsapp://send')) platforms.push('whatsapp');
      if (await Linking.canOpenURL('https://www.linkedin.com')) platforms.push('linkedin');
      
      platforms.push('generic', 'clipboard'); // Always available
    } catch (error) {
      console.error('Error checking platform availability:', error);
      platforms.push('generic', 'clipboard'); // Fallback
    }
    
    return platforms;
  }
}

export default SocialSharingService;
