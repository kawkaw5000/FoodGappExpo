import { View, Text, Image, Dimensions, TextInput, Button, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/buttons/CustomButton";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterMainScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [gender, setGender] = useState<number | null>(null);
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      setBirthdate(selectedDate);
    }
    setShowPicker(false);
  };

  const handleContinue = async () => {
    // Calculate age from birthdate
    let calculatedAge = null;
    if (birthdate) {
      const today = new Date();
      calculatedAge = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        calculatedAge--;
      }
    }

    // Save profile data to AsyncStorage
    const profileData = {
      firstName,
      lastName,
      age: calculatedAge,
      gender,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      birthdate: birthdate ? birthdate.toISOString() : null,
    };

    try {
      await AsyncStorage.setItem('registrationProfileData', JSON.stringify(profileData));
      router.replace("/(register)/registerScreen");
    } catch (error) {
      console.error('Error saving profile data:', error);
      router.replace("/(register)/registerScreen");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", margin: 0 }}>   
      <View style={{}}>
        <Image
          source={require("../../assets/images/foodGapp.png")}
          style={{
            width: width * 0.51,
            height: width * 0.51,
            resizeMode: "contain",
          }}
        />
      </View>
      <View style={{gap:40, width: "90%", position: "relative"}}>
        <View style={{position: "relative"}}>
          <TextInput
            style={{
              height: 40,
              borderColor: "black",
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 5,
              width: "100%",
            }}
            placeholder="Your first name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <View style={{position: "absolute", top:-30}}>
            <Text style={{fontSize: 15, fontWeight: "bold"}}>First name</Text>
          </View>
        </View> 
        <View style={{position: "relative"}}>
          <TextInput
            style={{
              height: 40,
              borderColor: "black",
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 5,
              width: "100%",
            }}
            placeholder="Your last name"
            value={lastName}
            onChangeText={setLastName}
          />
          <View style={{position: "absolute", top:-30}}>
            <Text style={{fontSize: 15, fontWeight: "bold"}}>Last name</Text>
          </View>
        </View> 
        <View style={{ gap: 10 }}>
          <View style={{ position: "absolute", top: -30 }}>
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>Birth Date</Text>
          </View>
          <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={1}>
            <View style={{ flexDirection: "row", alignItems: "center", position: "relative" }}>
              <TextInput
                style={{
                  height: 40,
                  borderColor: "black",
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  width: "100%",
                }}
                value={birthdate ? birthdate.toLocaleDateString("en-US") : ""} 
                placeholder="MM/DD/YYYY"
                editable={false}
              />
              <MaterialIcons
                name="date-range"
                size={24}
                color="black"
                style={{ position: "absolute", right: 10 }}
              />
            </View>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={birthdate || new Date()}
              mode="date"
              display="default"
              onChange={onChange}
            />
          )}
        </View>
        <View style={{ gap: 10}}>
          <View style={{ position: "absolute", top: -30 }}>
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>Gender</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: gender === 0 ? "black" : "gray",
                borderRadius: 5,
                paddingHorizontal: 15,
                paddingVertical: 10,
                flex: 1,
              }}
              onPress={() => setGender(0)}
            >
              <Text style={{ fontWeight: "bold" }}>Male</Text>
              <MaterialIcons
                name={gender === 0 ? "radio-button-checked" : "radio-button-unchecked"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: gender === 1 ? "black" : "gray",
                borderRadius: 5,
                paddingHorizontal: 15,
                paddingVertical: 10,
                flex: 1,
              }}
              onPress={() => setGender(1)}
            >
              <Text style={{ fontWeight: "bold" }}>Female</Text>
              <MaterialIcons
                name={gender === 1 ? "radio-button-checked" : "radio-button-unchecked"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: gender === 2 ? "black" : "gray",
                borderRadius: 5,
                paddingHorizontal: 15,
                paddingVertical: 10,
                flex: 1,
              }}
              onPress={() => setGender(2)}
            >
              <Text style={{ fontWeight: "bold" }}>Others</Text>
              <MaterialIcons
                name={gender === 2 ? "radio-button-checked" : "radio-button-unchecked"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>      
        </View>
        <View style={{flexDirection: 'row', gap: 20, justifyContent: 'space-between'}}> 
          <View>
            <TextInput
              style={{
                height: 40,
                borderColor: "black",
                borderWidth: 1,
                paddingHorizontal: 10,
                borderRadius: 5,
                width: width * 0.41,
              }}
              placeholder="Kilogram"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <View style={{position: "absolute", top:-30}}>
              <Text style={{fontSize: 15, fontWeight: "bold"}}>Weight</Text>
            </View>
          </View>
          <View>
            <TextInput
              style={{
                height: 40,
                borderColor: "black",
                borderWidth: 1,
                paddingHorizontal: 10,
                borderRadius: 5,
                width: width * 0.41,
              }}
              placeholder="Centimeter"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
            <View style={{position: "absolute", top:-30}}>
              <Text style={{fontSize: 15, fontWeight: "bold"}}>Height</Text>
            </View>
          </View>
        </View>   
        <View style={{ flexDirection: "row", justifyContent: "center",gap: 90, width: "100%" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#FCB647",
              width: 70,
              height: 70,
              borderRadius: 100,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
            }}
            onPress={() => router.replace("/(login)/loginScreen")}
          >
            <MaterialIcons name="arrow-back" size={54} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#FCB647",
              width: 70,
              height: 70,
              borderRadius: 100,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3, 
            }}
            onPress={handleContinue}
          >
            <MaterialIcons name="arrow-forward" size={54} color="white" />
          </TouchableOpacity>
        </View>  
      </View>

    </SafeAreaView>
  );
}
