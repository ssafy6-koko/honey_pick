import * as React from 'react'
import {memo, useState, useEffect, useCallback, useRef} from 'react'
import {
  SafeAreaView,
  StatusBar,
  Linking,
  View,
  Dimensions,
  Alert,
} from 'react-native'
import Config from 'react-native-config'
import ActionSheet from 'react-native-actions-sheet'

import BaseButton from '~/components/button/base'
import {getItem, itemToCollection} from '~/store/slices/item/asyncThunk'
import {ItemRoute} from './types'
import {useAppSelector, useAppDispatch} from '~/store/types'

import {useIsFocused, useRoute} from '@react-navigation/native'
import {Container, ImageContainer, MenuContainer, DashedBorder} from './styles'
import ItemInfo from './components/itemInfo'
import {isDashOn} from '~/store/slices/item'
import RecommendInfo from './components/recommendInfo'
import RecommendSettings from './components/recommendSettings'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import {RootStackParamList} from '~/../types/navigation'
import uiSlice from '~/store/slices/ui'

function ItemStack({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>
}) {
  const isFocused = useIsFocused()
  const dispatch = useAppDispatch()
  const dashOn = useAppSelector(isDashOn)
  const route = useRoute<ItemRoute>()
  const {itemId, collectionId} = route.params!
  const actionSheetRef = useRef<ActionSheet>(null)

  const {item, review} = useAppSelector(state => state.item)
  const {userId} = useAppSelector(state => state.user)
  const {currentCollection} = useAppSelector(state => state.collection)

  const isMyItem = userId === currentCollection!.user._id
  const [isRecommendMode, setIsRecommendMode] = useState(false)
  const {isModal} = useAppSelector(state => state.ui)
  const isValidItem = item.title || item.priceBefore

  useEffect(() => {
    if (isFocused && !isRecommendMode) {
      dispatch(getItem(itemId))
    }
  }, [isFocused, isRecommendMode])

  const openSheet = useCallback(() => {
    actionSheetRef.current?.show()
  }, [])

  const deleteItem = useCallback(() => {
    actionSheetRef.current?.hide()
    Alert.alert(
      '???????????? ??????????????? ???????????????.\n?????? ?????????????????????????',
      undefined,
      [
        {
          text: '??????',
          onPress: () => {
            dispatch(
              itemToCollection({
                itemId,
                originalCollectionId: collectionId,
              }),
            )
              .unwrap()
              .then(() => navigation.pop())
              .catch(error => {
                Alert.alert(
                  '????????? ?????? ???????????????.\n????????? ?????? ??????????????????.',
                )
              })
          },
        },
        {
          text: '??????',
        },
      ],
    )
  }, [collectionId])

  const toggleIsRecommendMode = useCallback(() => {
    actionSheetRef.current?.hide()
    setIsRecommendMode(!isRecommendMode)
  }, [isRecommendMode])

  // ?????? ?????? ????????? ?????? ??????, ?????? ????????? ?????? ????????? ???????????? ????????? ???
  const goToSite = useCallback(async () => {
    await Linking.openURL(item.url)
  }, [item.url])

  const saveMyCollection = () => {
    dispatch(uiSlice.actions.setIsModal('clipboard'))
  }

  return (
    <SafeAreaView style={{flex: 1, paddingTop: StatusBar.currentHeight}}>
      {isMyItem && collectionId !== '' ? (
        <ActionSheet
          ref={actionSheetRef}
          containerStyle={{borderTopLeftRadius: 25, borderTopRightRadius: 25}}>
          <MenuContainer>
            <BaseButton
              text={'??? ??????????????? ????????????'}
              onPress={deleteItem}
              borderRadius={25}
              marginVertical={5}
              paddingVertical={15}
            />
            {review ? (
              <BaseButton
                text={'?????? ?????? ????????????'}
                onPress={toggleIsRecommendMode}
                borderRadius={25}
                marginVertical={5}
                paddingVertical={15}
              />
            ) : (
              <BaseButton
                text={'??? ?????? ????????????'}
                onPress={toggleIsRecommendMode}
                borderRadius={25}
                marginVertical={5}
                paddingVertical={15}
              />
            )}
          </MenuContainer>
        </ActionSheet>
      ) : null}

      <Container>
        <ImageContainer
          source={
            item.thumbnail && isValidItem
              ? {uri: `${Config.IMAGE_BASE_URL}/w510/${item.thumbnail}`}
              : require('../../assets/images/honeybee.png')
          }
          imageStyle={{
            resizeMode: 'contain',
            borderRadius: 20,
          }}
        />
        <ItemInfo
          openSheet={openSheet}
          isRecommendMode={isRecommendMode}
          collectionId={collectionId}></ItemInfo>
        {dashOn ? <DashedBorder /> : null}
        {isRecommendMode ? (
          <RecommendSettings toggleIsRecommendMode={toggleIsRecommendMode} />
        ) : (
          <>
            <RecommendInfo />
            {isMyItem ? (
              <>
                {isValidItem ? (
                  <BaseButton
                    text={'???????????? ????????????'}
                    onPress={goToSite}
                    borderRadius={25}
                    marginVertical={10}
                    paddingVertical={15}
                  />
                ) : null}
              </>
            ) : (
              <View style={{flexDirection: 'row'}}>
                <>
                  {isValidItem ? (
                    <>
                      <BaseButton
                        flex={1}
                        text={'???????????? ????????????'}
                        onPress={goToSite}
                        borderRadius={25}
                        marginVertical={10}
                        paddingVertical={15}
                      />
                      <BaseButton
                        flex={1}
                        text={'??? ???????????? ??????'}
                        onPress={saveMyCollection}
                        borderRadius={25}
                        marginVertical={10}
                        paddingVertical={15}
                        marginLeft={10}
                      />
                    </>
                  ) : null}
                </>
              </View>
            )}
          </>
        )}
      </Container>
    </SafeAreaView>
  )
}

export default memo(ItemStack)
