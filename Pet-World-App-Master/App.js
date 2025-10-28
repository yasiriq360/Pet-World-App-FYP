import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './PetParent/HomeScreen'; 
import GetStarted from './PetParent/GetStarted'; 
import LoginScreen from './PetParent/LoginScreen'; 
import CreateAccount from './PetParent/CreateAccount';
import ValidationCodeScreen from './PetParent/ValidationCodeScreen';
import MainPage from './PetParent/MainPage';
import AddProfile from './PetParent/AddProfile';
import SelectDogPet from './PetParent/SelectDogPet';
import SelectCatPet from './PetParent/SelectCatPet';
import PetProfile from './PetParent/PetProfile';
import PetSize from './PetParent/PetSize';
import PetWeight from "./PetParent/PetWeight";
import PetDateBirth from "./PetParent/PetDateBirth";
import Functionality from "./PetParent/Functionality"
import PetProfileScreen from './PetParent/PetProfileScreen'
import EditPetProfile from './PetParent/EditPetProfile'
import Select from './PetParent/Select'
import ImageUpload from './PetParent/ImageUpload'
import Decision from './PetParent/Decision'
import ForgetPassword from './PetParent/ForgetPassword'
import UserProfile from './PetParent/UserProfile'
import Subscription from './PetParent/Subscription'
import PaymentScreen from './PetParent/PaymentScreen'
import Chatbot from './PetParent/Chatbot'
import ChatScreen from './PetParent/ChatScreen'
import Vets from './PetParent/Vets'
import BreedDetails from './PetParent/BreedDetails'
import SkinDiseaseRecognition from './PetParent/SkinDiseaseRecognition'
import VetLogin from './Vet/VetLogin'
import VetTimeAvailability from './Vet/VetTimeAvailability'
import VetProfileUpload from './Vet/VetProfileUpload'
import StartPage from './Vet/StartPage'
import AddVetProfile from './Vet/AddVetProfile'
import Mdocuments from './Vet/Mdocuments'
import Cdocuments from './Vet/Cdocuments'
import VetProfileVerification from './Vet/VetProfileVerification'
import VetRejected from './Vet/VetRejected'
import DashboardScreen from './Vet/DashboardScreen'
import VetProfile1 from './PetParent/VetProfile1'
import VetProfile from './Vet/VetProfile'
import EditVetProfile from './Vet/EditVetProfile'
import ChatListScreen from './Vet/ChatListScreen'
import VetLocationScreen from './Vet/VetLocationScreen'
import PetParentOverview from './Vet/PetParentOverview';
import { NotificationProvider } from './context/NotificationContext';
import BreedIdentification from './PetParent/BreedIdentification';
import NearbyVets from './PetParent/NearbyVets';
import ChatHistory from './PetParent/ChatHistory';
import { colors } from './theme/colors';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';



const Stack = createStackNavigator();

const App = () => {
  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false,title:false, }}
          />
            <Stack.Screen
            name="Select"
            component={Select}
            options={{ headerShown: false,title:false, }}
          />
          <Stack.Screen
            name="GetStarted"
            component={GetStarted}
            options={{ headerShown: false,title:false,}}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: true,title:false, headerTitle: "Login As Pet Parent" }}
          />
              <Stack.Screen
            name="CreateAccount"
            component={CreateAccount}
            options={{
              
              headerShown: true,
              title:true,
              headerTitle: "Create Account"
            }}
            />
            <Stack.Screen
            name="ValidationCodeScreen"
            component={ValidationCodeScreen}
            options={{ headerShown: true,title:false, }}
          />
          <Stack.Screen
            name="MainPage"
            component={MainPage}
            options={{ headerShown: false,title:false, }}
          />
            <Stack.Screen
            name="AddProfile"
            component={AddProfile}
            options={{ headerShown: true,title:false, }}
          />
           <Stack.Screen
            name="SelectDogPet"
            component={SelectDogPet}
            options={{ headerShown: true,title:false, }}
          />
           <Stack.Screen
            name="SelectCatPet"
            component={SelectCatPet}
            options={{ headerShown: true,title:false, }}
          />
            <Stack.Screen
            name="PetProfile"
            component={PetProfile}
            options={{ headerShown: true,title:false, }}
          />
            <Stack.Screen
            name="PetSize"
            component={PetSize}
            options={{ headerShown: true,title:false, }}
          />
            <Stack.Screen
            name="PetWeight"
            component={PetWeight}
            options={{ headerShown: true,title:false, }}
          />

           <Stack.Screen
            name="PetDateBirth"
            component={PetDateBirth}
            options={{ headerShown: true,title:false, }}
          />
           <Stack.Screen
            name="Functionality"
            component={Functionality}
            options={{ headerShown: false,title:false, }}
          />

         <Stack.Screen
            name="PetProfileScreen"
            component={PetProfileScreen}
            options={{ headerShown: true,title:false, }}
          />
          <Stack.Screen
            name="EditPetProfile"
            component={EditPetProfile}
            options={{ headerShown: true,title:false, }}
          />
           <Stack.Screen
            name="ImageUpload"
            component={ImageUpload}
            options={{ headerShown: true,title:false, }}
          />
           <Stack.Screen
            name="Decision"
            component={Decision}
            options={{ headerShown: true,title:false, }}
          />
          <Stack.Screen
            name="ForgetPassword"
            component={ForgetPassword}
            options={{ headerShown: true,title:true, headerTitle: "Forget Password" }}
          />
             <Stack.Screen
            name="UserProfile"
            component={UserProfile}
            options={{ headerShown: true,title:true, }}
          />  
           <Stack.Screen
            name="Subscription"
            component={Subscription}
            options={{ headerShown: false,title:false, }}
          />
          <Stack.Screen
            name="PaymentScreen"
            component={PaymentScreen}
            options={{ headerShown: true,title:false, }}
          />
            <Stack.Screen
            name="Chatbot"
            component={Chatbot}
            options={{ headerShown: true,title:true, }}
          />
           <Stack.Screen
            name="SkinDiseaseRecognition"
            component={SkinDiseaseRecognition}
            options={{ headerShown: true,title:true, }}
          />
               <Stack.Screen
            name="VetLogin"
            component={VetLogin}
            options={{ headerShown: true,title:false, headerTitle: "Login As Vet" }}
          />
                  <Stack.Screen
            name="VetTimeAvailability"
            component={VetTimeAvailability}
            options={{ headerShown: true,title:false, }}
          />

            <Stack.Screen
            name="VetProfileUpload"
            component={VetProfileUpload}
            options={{ headerShown: true,title:true,  }}
          />
            <Stack.Screen
            name="StartPage"
            component={StartPage}
            options={{ headerShown: false,title:false, }}
          />
          <Stack.Screen
            name="AddVetProfile"
            component={AddVetProfile}
            options={{ headerShown: true,title:true, headerTitle: "Add Vet Profile" }}
          />
          <Stack.Screen
            name="Mdocuments"
            component={Mdocuments}
            options={{ headerShown: false,title:false, }}
          />
          <Stack.Screen
            name="Cdocuments"
            component={Cdocuments}
            options={{ headerShown: false,title:false, }}
          />
          <Stack.Screen
            name="VetProfileVerification"
            component={VetProfileVerification}
            options={{ headerShown: false,title:false, }}
          />
          <Stack.Screen
            name="VetRejected"
            component={VetRejected}
            options={{ headerShown: false,title:false, }}
          />
          <Stack.Screen
            name="DashboardScreen"
            component={DashboardScreen}
            options={{ headerShown: false,title:false, }}
          />
          <Stack.Screen
            name="VetProfile"
            component={VetProfile}
            options={{ headerShown: true,title:false, }}
          />
           <Stack.Screen
            name="EditVetProfile"
            component={EditVetProfile}
            options={{ headerShown: true,title:false, }}
          />
           <Stack.Screen
            name="VetProfile1"
            component={VetProfile1}
            options={{ headerShown: true,title:false, }}
          />
          <Stack.Screen
            name="Vets"
            component={Vets}
            options={{ headerShown: true,title:false, }}
          />
              <Stack.Screen
            name="BreedDetails"
            component={BreedDetails}
            options={{ headerShown: true,title:false, }}
          />
           <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{ headerShown: true,title:false, }}
          />

          <Stack.Screen
            name="ChatListScreen"
            component={ChatListScreen}
            options={({ navigation }) => ({
              headerShown: true, 
              title: 'Chats',
             
              headerTitleStyle: {
                textAlign: 'center',
              },
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{marginLeft: 10}}>
                  <Ionicons name="chevron-back" size={28} color={colors.primary} />
                </TouchableOpacity>
              )
            })}
          />
          <Stack.Screen name="PetParentOverview" component={PetParentOverview} />
         

          
          <Stack.Screen
            name="VetLocationScreen"
            component={VetLocationScreen}
            options={{ headerShown: false, title: false }}
          />

          <Stack.Screen
            name="BreedIdentification"
            component={BreedIdentification}
            options={{ 
              headerShown: true,
              title: 'Breed Identification',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTintColor: colors.background,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="NearbyVets"
            component={NearbyVets}
            options={{ headerShown: true, title: 'Nearby Vets' }}
          />
          <Stack.Screen
            name="ChatHistory"
            component={ChatHistory}
            options={{ 
              headerShown: true,
              title: 'Chat History',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTintColor: colors.background,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
};

export default App;
