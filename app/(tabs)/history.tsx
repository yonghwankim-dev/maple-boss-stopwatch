import { useCharacter } from "@/src/context/CharacterContext";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, IconButton, List, Menu, Provider, Text } from "react-native-paper";

export default function CharacterHistoryScreen(){
    const {characters, persistentRecords, deleteFromPersistent} = useCharacter();
    const [selectedCharName, setSelectedCharName] = useState<string>(characters[0]?.name || '');
    const [charMenuVisible, setCharMenuVisible] = useState<boolean>(false);

    const filteredRecords = useMemo(()=>{
        if(!selectedCharName){
            return [];
        }
        return persistentRecords
            .filter((record)=>record.characterName === selectedCharName)
            .sort((a,b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [persistentRecords, selectedCharName]);

    const handleDeleteRecord = async (id: string)=>{
        await deleteFromPersistent(id);
    };

    return (
        <Provider>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* 캐릭터 필터 선택 */}
                <Card style={styles.card}>
                    <Card.Title title="캐릭터별 기록 조회" subtitle="조회할 캐릭터를 선택하세요."/>
                    <Card.Content>
                        {/* 캐릭터 선택 메뉴 */}
                        <Menu
                            visible={charMenuVisible}
                            onDismiss={()=>setCharMenuVisible(false)}
                            anchor={
                            <Button
                                mode="outlined"
                                onPress={()=>setCharMenuVisible(true)}
                                style={styles.pickerBtn}
                                contentStyle={styles.pickerBtnContent}
                            >
                                {selectedCharName ? `${selectedCharName}` : '캐릭터 선택하기'}
                            </Button>
                            } 
                        >
                            {characters.map((char)=>(
                                <Menu.Item
                                    key={char.id}
                                    onPress={()=>{setSelectedCharName(char.name); setCharMenuVisible(false);}}
                                    title={char.name}                    
                                />
                            ))}
                            {characters.length === 0 && (
                                <Menu.Item title="등록된 캐릭터가 없습니다." disabled/>
                            )}
                        </Menu>
                    </Card.Content>
                </Card>

                {/* 필터링된 보스 클리어 리스트 출력 구역 */}
                <Card style={styles.card}>
                    <Card.Title
                        title={selectedCharName ? `[${selectedCharName}] 보스 클리어 기록` : '보스 클리어 기록'}
                        subtitle={`총 ${filteredRecords.length}개의 기록이 있습니다.`}
                    />
                    <Card.Content style={{paddingHorizontal: 0}}>
                        <Divider/>

                        {filteredRecords.map((item)=>(
                            <React.Fragment key={item.id}>
                                <List.Item
                                    title={`${item.bossName} (${item.difficulty})`}
                                    titleStyle={styles.bossTitle}
                                    description={`⏱️ 클리어 시간: ${item.clearTime}  |  📅 날짜: ${item.createdAt}`}
                                    descriptionStyle={styles.bossDescription}
                                    right={(props)=>{
                                        <IconButton
                                            {...props}
                                            icon="delete-outlined"
                                            iconColor="#ff4d4d"
                                            size={22}
                                            onPress={()=>handleDeleteRecord(item.id)}
                                            style={styles.deleteIconBtn}
                                        />
                                    }}
                                    style={styles.listItem}
                                />
                            </React.Fragment>
                        ))}
                        {/* 데이터가 없을때 예외 처리 */}
                        {filteredRecords.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {selectedCharName ? "해당 캐릭터로 등록된 보스 클리어 기록이 없습니다." : "조회할 캐릭터를 상단에서 먼저 선택해 주세요."}
                                </Text>
                            </View>
                        )}


                    </Card.Content>
                </Card>
            </ScrollView>
        </Provider>
    );
}

const styles = StyleSheet.create({
  container: { 
    flex:1, 
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center'
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff"
  },
  pickerBtn: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  pickerBtnContent: {
    height: 48,
    justifyContent: 'center'
  },
  // 리스트 아이템 스타일
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  bossTitle:{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3'
  },
  bossDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4
  },
  deleteIconBtn: {
    alignSelf: 'center',
    marginRight: 0
  },
  // 예외 케이스 뷰
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: 'transaprent'
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14
  }
});