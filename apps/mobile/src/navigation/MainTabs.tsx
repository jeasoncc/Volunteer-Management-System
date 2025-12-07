import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'react-native-paper';

import CheckinScreen from '../screens/CheckinScreen';
import ScriptureScreen from '../screens/ScriptureScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DailyPracticeScreen from '../screens/DailyPracticeScreen';
import HomeDashboard from '../components/HomeDashboard';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeDashboard}
        options={{
          title: '首页',
          tabBarLabel: '首页',
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Checkin"
        component={CheckinScreen}
        options={{
          title: '打卡记录',
          tabBarLabel: '打卡',
          tabBarIcon: ({color, size}) => (
            <Icon name="clock-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scripture"
        component={ScriptureScreen}
        options={{
          title: '佛经阅读',
          tabBarLabel: '佛经',
          tabBarIcon: ({color, size}) => (
            <Icon name="book-open-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DailyPractice"
        component={DailyPracticeScreen}
        options={{
          title: '每日功课',
          tabBarLabel: '功课',
          tabBarIcon: ({color, size}) => (
            <Icon name="meditation" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '个人中心',
          tabBarLabel: '我的',
          tabBarIcon: ({color, size}) => (
            <Icon name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

