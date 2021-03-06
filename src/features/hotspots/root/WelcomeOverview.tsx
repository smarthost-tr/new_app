import { isEqual } from 'lodash'
import React, { useEffect, useState, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import Box from '../../../components/Box'
import EmojiBlip from '../../../components/EmojiBlip'
import Text from '../../../components/Text'
import { RootState } from '../../../store/rootReducer'
import animateTransition from '../../../utils/animateTransition'
import { useAppDispatch } from '../../../store/store'
import useMount from '../../../utils/useMount'
import { fetchHotspotsData } from '../../../store/hotspots/hotspotsSlice'

const TimeOfDayTitle = ({ date }: { date: Date }) => {
  const { t } = useTranslation()
  const hours = date.getHours()
  let timeOfDay = t('time.afternoon')
  if (hours >= 4 && hours < 12) {
    timeOfDay = t('time.morning')
  }
  if (hours >= 17 || hours < 4) {
    timeOfDay = t('time.evening')
  }
  return (
    <Text
      variant="h1"
      color="primaryText"
      maxFontSizeMultiplier={1}
      marginTop="s"
    >
      {timeOfDay}
    </Text>
  )
}

const WelcomeOverview = () => {
  const { t } = useTranslation()
  const [bodyText, setBodyText] = useState('')
  const [{ hotspotsLoaded }, setHasLoadedWelcome] = useState({
    hotspotsLoaded: false,
  })
  const hotspots = useSelector(
    (state: RootState) => state.hotspots.hotspots.data,
    isEqual,
  )
  const dispatch = useAppDispatch()

  useMount(() => {
    dispatch(fetchHotspotsData())
  })
  const visibleHotspots = useMemo(() => {
    return hotspots
  }, [hotspots])

  const hotspotsLoading = useSelector(
    (state: RootState) => state.hotspots.hotspotsLoaded,
  )

  useEffect(() => {
    if (hotspotsLoaded) return

    const nextLoaded = {
      hotspotsLoaded: hotspotsLoaded || !hotspotsLoading,
    }

    if (nextLoaded.hotspotsLoaded) {
      animateTransition('WelcomeOverview.LoadingChange', {
        enabledOnAndroid: false,
      })
    }

    setHasLoadedWelcome(nextLoaded)
  }, [hotspotsLoaded, hotspotsLoading])

  const updateBodyText = useCallback(async () => {
    if (!hotspotsLoaded) return

    const hotspotCount = visibleHotspots.length
    let nextBodyText = ''

    nextBodyText = t('hotspots.owned.hotspot_plural', {
      count: hotspotCount,
    })

    setBodyText(nextBodyText)
  }, [hotspotsLoaded, visibleHotspots.length, t])

  useEffect(() => {
    updateBodyText()
  }, [updateBodyText])

  const [date, setDate] = useState(new Date())
  useEffect(() => {
    const dateTimer = setInterval(() => setDate(new Date()), 300000) // update every 5 min
    return () => clearInterval(dateTimer)
  })

  return (
    <Box alignItems="center" backgroundColor="primaryBackground">
      <EmojiBlip date={date} />
      <TimeOfDayTitle date={date} />
      <Box marginTop="m" marginBottom="xxl">
        {hotspotsLoaded ? (
          <Text
            variant="light"
            fontSize={20}
            lineHeight={24}
            textAlign="center"
            color="HelperText"
            maxFontSizeMultiplier={1.2}
          >
            {bodyText}
          </Text>
        ) : (
          <SkeletonPlaceholder speed={3000}>
            <SkeletonPlaceholder.Item
              height={20}
              width={320}
              marginBottom={4}
              borderRadius={4}
            />
            <SkeletonPlaceholder.Item
              alignSelf="center"
              height={20}
              marginBottom={4}
              width={280}
              borderRadius={4}
            />
          </SkeletonPlaceholder>
        )}
      </Box>
    </Box>
  )
}

export default memo(WelcomeOverview)
