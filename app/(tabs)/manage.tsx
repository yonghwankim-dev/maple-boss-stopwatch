import { View } from "@/components/Themed";
import { useCharacter } from "@/src/context/CharacterContext";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet } from "react-native";
import { Button, Card, Divider, HelperText, IconButton, List, Provider, TextInput } from "react-native-paper";

export default function ManageCharactersScreen(){
    // 전역 Context에서 캐릭터 목록 및 추가/삭제 메서드 공급받기
    const {characters, addCharacter, deleteCharacter, updateChracter } = useCharacter();

    // 입력 필드 로컬 상태 관리
    const [newCharacterName, setNewCharacterName] = useState<string>('');

    // 편집 상태 관리를 위한 로컬 상태 정의
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>('');

    const handleAdd = ()=>{
        const result = addCharacter(newCharacterName);
        if(result.success){
            const message = "캐릭터 등록에 성공하였습니다."
            if(Platform.OS === 'web'){
                alert(message);
            }else{
                Alert.alert("캐릭터 등록", message)
            }
        }else{
            if(Platform.OS === 'web'){
                alert("캐릭터 등록에 실패하였습니다.");
            }else{
                Alert.alert("경고", result.error);
            }
            return;
        }
        setNewCharacterName('');
    }

    // 편집 모드 진입 설정
    const startEditing = (id: string, currentName: string)=>{
        setEditingId(id);
        setEditingName(currentName);
    };

    // 편집 저장 핸들러
    const handleUpdate = (id: string, oldName: string)=>{
        const result = updateChracter(id, oldName, editingName); 
        if(!result.success){
            if(Platform.OS === 'web'){
                alert(result.error);
            }else{
                Alert.alert("경고", result.error);
            }
            return;
        }
        setEditingId(null); // 편집 모드 종료
    }

    const handleDeletePrompt = (id: string, name: string)=>{
        const message = `'${name} 캐릭터를 삭제하시겠습니까?\n삭제 시 해당 캐릭터의 모든 보스 클리어 기록도 함께 영구 삭제됩니다.'`;
        
        if(Platform.OS === 'web'){
            if(window.confirm(message)){
                deleteCharacter(id, name);
            }
        }else{
            Alert.alert("캐릭터 삭제", message, [
                {text: "취소", style: "cancel"},
                {
                    text: "확인",
                    style: "destructive",
                    onPress: ()=>deleteCharacter(id, name)
                }
            ]);
        }
    };

    return (
        <Provider>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* 캐릭터 추가 섹션 */}
                <Card style={styles.card}>
                    <Card.Title title="새 캐릭터 등록" subtitle="시간을 측정할 캐릭터를 추가하세요."/>
                    <Card.Content>
                        <View style={styles.addCharRow}>
                            <TextInput
                                label={"캐릭터 이름"}
                                value={newCharacterName}
                                onChangeText={setNewCharacterName}
                                mode="outlined"
                                style={styles.charInput}
                                dense
                            />
                            <Button
                                mode="contained"
                                onPress={handleAdd}
                                style={styles.rectBtn}
                                contentStyle={styles.rectBtnContent}
                            >
                                등록
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                {/* 캐릭터 목록 및 수정/삭제 섹션 */}
                <Card style={styles.card}>
                    <Card.Title title="보유 캐릭터 목록" subtitle={`총 ${characters.length}개의 캐릭터가 등록되어 있습니다.`}/>
                    <Card.Content>
                        {characters.map((char, index)=>(
                            <React.Fragment key={char.id}>
                                <View style={styles.listItemContainer}>
                                    {editingId === char.id ? (
                                        <View style={styles.editRow}>
                                            <TextInput
                                                value={editingName}
                                                onChangeText={setEditingName}
                                                mode="outlined"
                                                style={styles.editInput}
                                                dense
                                                autoFocus
                                            />
                                            <Button mode="contained" onPress={()=>handleUpdate(char.id, char.name)} style={styles.saveBtn}>
                                                저장
                                            </Button>
                                            <Button mode="outlined" onPress={()=>setEditingId(null)} style={styles.cancelBtn}>
                                                취소
                                            </Button>                                         
                                        </View>

                                    ) : (
                                        // 일반 모드: 캐릭터 이름 및 [편집], [삭제] 버튼 표시
                                        <>
                                            <List.Item
                                                title={char.name}
                                                titleStyle={styles.charTitle}
                                                style={styles.listItem}
                                            />
                                            <View style={styles.actionButtons}>
                                                <IconButton
                                                    icon="pencil"
                                                    iconColor="#2196f3"
                                                    size={22}
                                                    onPress={()=>startEditing(char.id, char.name)}
                                                />
                                                {/* 단일 캐릭터일때 삭제를 방지하는 최소 안전장치 */}
                                                {characters.length > 1 && (
                                                    <IconButton
                                                        icon="delete"
                                                        iconColor="#ff4d4d"
                                                        size={24}
                                                        onPress={()=>handleDeletePrompt(char.id, char.name)}
                                                        style={styles.deleteIcon}
                                                    />
                                                )}
                                            </View>
                                        </>
                                    )}
                                </View>
                                {index < characters.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}

                        {characters.length === 0 && (
                            <HelperText type="info" style={styles.emptyText}>
                                등록된 캐릭터가 없습니다. 새로운 캐릭터를 등록해주세요.
                            </HelperText>
                        )}
                    </Card.Content>
                </Card>
            </ScrollView>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    contentContainer: {
        padding: 16,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center'
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2
    },
    addCharRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    charInput: {
        flex: 1
    },
    rectBtn: {
        borderRadius: 4,
        justifyContent: 'center',
        backgroundColor: '#2196f3'
    },
    rectBtnContent: {
        height: 48,
        paddingHorizontal: 16
    },
    // 리스트 아이템 행 레이아웃
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent'
    },
    listItem: {
        flex: 1,
        paddingVertical: 4        
    },
    charTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    deleteIcon: {
        marginRight: 8
    },
    emptyText: {
        textAlign: 'center',
        marginVertical: 30,
        fontSize: 14
    },
    // 인라인 편집용 스타일
    editRow: {
        flexDirection: 'row',
        flex: 1,
        gap: 6,
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: 'transaprent'
    },
    editInput: {
        flex: 1,
        height: 40
    },
    saveBtn: {
        borderRadius: 4,
        backgroundColor: '#4caf50',
        height: 40,
        justifyContent: 'center'
    },
    cancelBtn: {
        borderRadius: 4,
        height: 40,
        justifyContent: 'center',
        borderColor: '#ccc'
    }
});