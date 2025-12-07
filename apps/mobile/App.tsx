/**
 * 莲花斋义工移动端应用
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar, StyleSheet} from 'react-native';

import MainTabs from './src/navigation/MainTabs';
import LoginScreen from './src/screens/LoginScreen';
import CheckinDetailScreen from './src/screens/CheckinDetailScreen';
import ScriptureReaderScreen from './src/screens/ScriptureReaderScreen';
import DailyPracticeScreen from './src/screens/DailyPracticeScreen';
import PracticeHistoryScreen from './src/screens/PracticeHistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoadingScreen from './src/components/LoadingScreen';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {ScriptureProvider} from './src/context/ScriptureContext';
import {DailyPracticeProvider} from './src/context/DailyPracticeContext';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return <LoadingScreen message="正在加载..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="CheckinDetail"
              component={CheckinDetailScreen}
              options={{headerShown: true, title: '打卡详情'}}
            />
            <Stack.Screen
              name="ScriptureReader"
              component={ScriptureReaderScreen}
              options={{headerShown: true, title: '佛经阅读'}}
            />
            <Stack.Screen
              name="DailyPractice"
              component={DailyPracticeScreen}
              options={{headerShown: true, title: '每日功课'}}
            />
            <Stack.Screen
              name="PracticeHistory"
              component={PracticeHistoryScreen}
              options={{headerShown: true, title: '功课历史'}}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{headerShown: true, title: '设置'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider>
            <AuthProvider>
              <ScriptureProvider>
                <DailyPracticeProvider>
                  <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                  <AppNavigator />
                </DailyPracticeProvider>
              </ScriptureProvider>
            </AuthProvider>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

