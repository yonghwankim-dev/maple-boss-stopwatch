import { Ionicons } from '@expo/vector-icons';
import { ColorValue, StyleSheet } from 'react-native';

interface TabBarIconProps{
    name: React.ComponentProps<typeof Ionicons>['name'];
    color: ColorValue;
    focused?: boolean;
}

export default function TabBarIcon({name, color, focused}: TabBarIconProps){
    return (
        <Ionicons
            name={name}
            size={26}
            color={color}
            style={styles.icon}
        />
    );
}

const styles = StyleSheet.create({
  icon: {
    marginBottom: -3, // 하단 탭 바 라벨 텍스트와의 시각적 밸런스를 맞추기 위한 여백 조정
  },
});