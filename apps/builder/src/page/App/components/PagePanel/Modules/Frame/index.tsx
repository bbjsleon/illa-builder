import { FC, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import {
  InputNumber,
  RadioGroup,
  Switch,
  useMessage,
  useModal,
} from "@illa-design/react"
import { ReactComponent as FrameFixedIcon } from "@/assets/rightPagePanel/frame-fixed.svg"
import { ReactComponent as FrameResponsiveIcon } from "@/assets/rightPagePanel/frame-responsive.svg"
import { PanelBar } from "@/components/PanelBar"
import i18n from "@/i18n/config"
import {
  BODY_MIN_HEIGHT,
  BODY_MIN_WIDTH,
  DEFAULT_PERCENT_WIDTH,
  DEFAULT_PX_WIDTH,
  FOOTER_MIN_HEIGHT,
  HEADER_MIN_HEIGHT,
  LEFT_MIN_WIDTH,
  RIGHT_MIN_WIDTH,
} from "@/page/App/components/DotPanel/renderSection"
import { PageLabel } from "@/page/App/components/PagePanel/Components/Label"
import { LayoutSelect } from "@/page/App/components/PagePanel/Components/LayoutSelect"
import { PanelActionBar } from "@/page/App/components/PagePanel/Components/PanelActionBar"
import { PanelDivider } from "@/page/App/components/PagePanel/Layout/divider"
import { LeftAndRightLayout } from "@/page/App/components/PagePanel/Layout/leftAndRight"
import { SetterPadding } from "@/page/App/components/PagePanel/Layout/setterPadding"
import { optionListWrapperStyle } from "@/page/App/components/PagePanel/style"
import { getCanvasShape } from "@/redux/config/configSelector"
import {
  getCanvas,
  searchDsl,
} from "@/redux/currentApp/editor/components/componentsSelector"
import { componentsActions } from "@/redux/currentApp/editor/components/componentsSlice"
import { PageNodeProps } from "@/redux/currentApp/editor/components/componentsState"
import { getRootNodeExecutionResult } from "@/redux/currentApp/executionTree/executionSelector"
import { RootState } from "@/store"
import { groupWrapperStyle } from "./style"

const getRealCanvasWidth = (canvasWidth: unknown) => {
  if (typeof canvasWidth !== "number") return 100
  return canvasWidth
}

const canvasSizeOptions = [
  {
    label: (
      <div css={optionListWrapperStyle}>
        <FrameResponsiveIcon />
        <span>{i18n.t("page.size.model.auto")}</span>
      </div>
    ),
    value: "auto",
  },
  {
    label: (
      <div css={optionListWrapperStyle}>
        <FrameFixedIcon />
        <span>{i18n.t("page.size.model.fixed")}</span>
      </div>
    ),
    value: "fixed",
  },
]

export const PageFrame: FC = () => {
  const { t } = useTranslation()
  const rootNodeProps = useSelector(getRootNodeExecutionResult)
  const { currentPageIndex, pageSortedKey } = rootNodeProps
  const currentPageDisplayName = pageSortedKey[currentPageIndex]
  const pageProps = useSelector<RootState>((state) => {
    const canvas = getCanvas(state)
    return searchDsl(canvas, currentPageDisplayName)?.props || {}
  }) as PageNodeProps
  const message = useMessage()

  const canvasShape = useSelector(getCanvasShape)
  const dispatch = useDispatch()
  const {
    canvasSize,
    canvasWidth,
    layout,
    leftWidth,
    rightWidth,
    topHeight,
    bottomHeight,
    isLeftFixed,
    isRightFixed,
    isFooterFixed,
    isHeaderFixed,
    hasLeft,
    hasRight,
    hasFooter,
    hasHeader,
    showLeftFoldIcon,
    showRightFoldIcon,
  } = pageProps

  const bodyWidth = useMemo(() => {
    if (canvasSize === "fixed") return canvasWidth - leftWidth - rightWidth
    return 100 - leftWidth - rightWidth
  }, [canvasSize, canvasWidth, leftWidth, rightWidth])

  const finalCanvasWidth = getRealCanvasWidth(canvasWidth)

  const finalCanvasSize = canvasSize === "fixed" ? "fixed" : "auto"

  const widthI18n = useMemo(() => {
    return canvasSize === "fixed"
      ? `${t("editor.page.label_name.width")}(px)`
      : `${t("editor.page.label_name.width")}(%)`
  }, [canvasSize, t])

  const modal = useModal()

  const handleDeleteSection = useCallback(
    (
      deleteSectionName:
        | "leftSection"
        | "rightSection"
        | "headerSection"
        | "footerSection",
      options: Record<string, any>,
    ) => {
      if (!currentPageDisplayName) return
      modal.show({
        w: "496px",
        children: t("editor.page.model_tips.delete_section_message"),
        cancelText: t("editor.page.model_tips.cancel_button"),
        okText: t("editor.page.model_tips.ok_button"),
        okButtonProps: {
          colorScheme: "red",
        },
        closable: false,
        onOk: () => {
          dispatch(
            componentsActions.deleteTargetPageSectionReducer({
              pageName: currentPageDisplayName,
              deleteSectionName,
              options,
            }),
          )
        },
      })
    },
    [currentPageDisplayName, dispatch, modal, t],
  )

  const handleAddSection = useCallback(
    (
      addedSectionName:
        | "leftSection"
        | "rightSection"
        | "headerSection"
        | "footerSection",
      options: Record<string, any>,
    ) => {
      if (!currentPageDisplayName) return
      dispatch(
        componentsActions.addTargetPageSectionReducer({
          pageName: currentPageDisplayName,
          addedSectionName,
          options,
        }),
      )
    },
    [currentPageDisplayName, dispatch],
  )

  const handleUpdateBodyPanelWidth = useCallback(
    (value?: number) => {
      if (!currentPageDisplayName || !value) return
      let finalValue = value
      let finalLeftValue = leftWidth
      let finalRightValue = rightWidth
      if (canvasSize === "fixed") {
      } else {
        let finalLeftValuePX = (finalLeftValue / 100) * canvasShape.canvasWidth
        let finalRightValuePX =
          (finalRightValue / 100) * canvasShape.canvasWidth
        let finalValuePX = (finalValue / 100) * canvasShape.canvasWidth
        if (finalValuePX <= BODY_MIN_HEIGHT) {
          const restWidth = canvasShape.canvasWidth - BODY_MIN_HEIGHT
          finalLeftValuePX =
            (finalLeftValuePX / (finalLeftValuePX + finalRightValuePX)) *
            restWidth
          finalRightValuePX = restWidth - finalLeftValuePX
          finalLeftValue = (finalLeftValuePX / canvasShape.canvasWidth) * 100
          finalRightValue = (finalRightValuePX / canvasShape.canvasWidth) * 100
        } else {
          let restWidth = canvasShape.canvasWidth - finalValuePX
          finalLeftValuePX =
            (finalLeftValuePX / (finalLeftValuePX + finalRightValuePX)) *
            restWidth
          if (finalLeftValuePX < LEFT_MIN_WIDTH) {
            finalLeftValuePX = LEFT_MIN_WIDTH
          }
          finalRightValuePX = restWidth - finalLeftValuePX
          if (finalRightValuePX < RIGHT_MIN_WIDTH) {
            finalRightValuePX = LEFT_MIN_WIDTH
          }
          finalLeftValue = (finalLeftValuePX / canvasShape.canvasWidth) * 100
          finalRightValue = (RIGHT_MIN_WIDTH / canvasShape.canvasWidth) * 100
        }
      }

      dispatch(
        componentsActions.updateTargetPagePropsReducer({
          pageName: currentPageDisplayName,
          newProps: {
            leftWidth: finalLeftValue,
            rightWidth: finalRightValue,
          },
        }),
      )
    },
    [
      canvasShape.canvasWidth,
      canvasSize,
      currentPageDisplayName,
      dispatch,
      leftWidth,
      rightWidth,
    ],
  )

  const handleUpdateLeftPanelWidth = useCallback(
    (value?: number) => {
      if (!currentPageDisplayName || !value) return
      let finalValue = value
      if (canvasSize === "fixed") {
      } else {
        const leftWidthPX = (value / 100) * canvasShape.canvasWidth
        const currentRightWidthPX = (rightWidth / 100) * canvasShape.canvasWidth
        if (
          canvasShape.canvasWidth - leftWidthPX - currentRightWidthPX <
          BODY_MIN_WIDTH
        ) {
          finalValue =
            ((canvasShape.canvasWidth - currentRightWidthPX - BODY_MIN_WIDTH) /
              canvasShape.canvasWidth) *
            100
        }
        if ((value / 100) * canvasShape.canvasWidth < LEFT_MIN_WIDTH) {
          finalValue = (LEFT_MIN_WIDTH / canvasShape.canvasWidth) * 100
        }
      }

      dispatch(
        componentsActions.updateTargetPagePropsReducer({
          pageName: currentPageDisplayName,
          newProps: {
            leftWidth: finalValue,
          },
        }),
      )
    },
    [
      canvasShape.canvasWidth,
      canvasSize,
      currentPageDisplayName,
      dispatch,
      rightWidth,
    ],
  )

  const handleUpdateRightPanelWidth = useCallback(
    (value?: number) => {
      if (!currentPageDisplayName || !value) return
      let finalValue = value
      if (canvasSize === "fixed") {
      } else {
        const rightWidthPX = (value / 100) * canvasShape.canvasWidth
        const currentLeftWidthPX = (leftWidth / 100) * canvasShape.canvasWidth
        if (
          canvasShape.canvasWidth - rightWidthPX - currentLeftWidthPX <
          BODY_MIN_WIDTH
        ) {
          finalValue =
            ((canvasShape.canvasWidth - currentLeftWidthPX - BODY_MIN_WIDTH) /
              canvasShape.canvasWidth) *
            100
        }
        if ((value / 100) * canvasShape.canvasWidth < RIGHT_MIN_WIDTH) {
          finalValue = (RIGHT_MIN_WIDTH / canvasShape.canvasWidth) * 100
        }
      }

      dispatch(
        componentsActions.updateTargetPagePropsReducer({
          pageName: currentPageDisplayName,
          newProps: {
            rightWidth: finalValue,
          },
        }),
      )
    },
    [
      canvasShape.canvasWidth,
      canvasSize,
      currentPageDisplayName,
      dispatch,
      leftWidth,
    ],
  )

  const handleUpdateHeaderPanelWidth = useCallback(
    (value?: number) => {
      if (!currentPageDisplayName || !value) return
      let finalValue = value
      if (canvasSize === "fixed") {
      } else {
        if (canvasShape.canvasHeight - value - bottomHeight < BODY_MIN_HEIGHT) {
          finalValue = canvasShape.canvasHeight - bottomHeight - BODY_MIN_HEIGHT
        }
        if (value < HEADER_MIN_HEIGHT) {
          finalValue = HEADER_MIN_HEIGHT
        }
      }

      dispatch(
        componentsActions.updateTargetPagePropsReducer({
          pageName: currentPageDisplayName,
          newProps: {
            topHeight: finalValue,
          },
        }),
      )
    },
    [
      bottomHeight,
      canvasShape.canvasHeight,
      canvasSize,
      currentPageDisplayName,
      dispatch,
    ],
  )

  const handleUpdateFooterPanelWidth = useCallback(
    (value?: number) => {
      if (!currentPageDisplayName || !value) return
      let finalValue = value
      if (canvasSize === "fixed") {
      } else {
        if (canvasShape.canvasHeight - value - topHeight < BODY_MIN_HEIGHT) {
          finalValue = canvasShape.canvasHeight - topHeight - BODY_MIN_HEIGHT
        }
        if (value < FOOTER_MIN_HEIGHT) {
          finalValue = FOOTER_MIN_HEIGHT
        }
      }

      dispatch(
        componentsActions.updateTargetPagePropsReducer({
          pageName: currentPageDisplayName,
          newProps: {
            bottomHeight: finalValue,
          },
        }),
      )
    },
    [
      canvasShape.canvasHeight,
      canvasSize,
      currentPageDisplayName,
      dispatch,
      topHeight,
    ],
  )

  const handleUpdateShowFoldIcon = useCallback(
    (value: boolean, sectionName: string) => {
      if (!currentPageDisplayName) return
      const newProps =
        sectionName === "leftSection"
          ? {
              showLeftFoldIcon: value,
            }
          : { showRightFoldIcon: value }
      dispatch(
        componentsActions.updateTargetPagePropsReducer({
          pageName: currentPageDisplayName,
          newProps,
        }),
      )
    },
    [currentPageDisplayName, dispatch],
  )

  const handleUpdateFrameSize = useCallback(
    (value: "auto" | "fixed") => {
      if (canvasSize === value || !currentPageDisplayName) return
      const newProps: Partial<PageNodeProps> = {
        canvasSize: value,
        canvasWidth:
          value === "fixed"
            ? DEFAULT_PX_WIDTH.CANVAS
            : DEFAULT_PERCENT_WIDTH.CANVAS,
      }
      if (value === "fixed") {
        if (hasLeft) newProps.leftWidth = DEFAULT_PX_WIDTH.LEFT
        if (hasRight) newProps.rightWidth = DEFAULT_PX_WIDTH.RIGHT
      } else {
        if (hasLeft) newProps.leftWidth = DEFAULT_PERCENT_WIDTH.LEFT
        if (hasRight) newProps.rightWidth = DEFAULT_PERCENT_WIDTH.RIGHT
      }
      dispatch(
        componentsActions.updateTargetPagePropsReducer({
          pageName: currentPageDisplayName,
          newProps,
        }),
      )
    },
    [canvasSize, currentPageDisplayName, dispatch, hasLeft, hasRight],
  )

  const handleChangeCanvasWidth = useCallback(
    (value?: number) => {
      if (!currentPageDisplayName || value == undefined) return

      let newProps = {
        canvasWidth: value,
      }
      dispatch(
        componentsActions.updateTargetPagePropsReducer({
          pageName: currentPageDisplayName,
          newProps,
        }),
      )
    },
    [currentPageDisplayName, dispatch],
  )

  const handleBlurCanvasWidth = useCallback(() => {
    if (canvasSize === "fixed") {
      if (canvasWidth < BODY_MIN_WIDTH + LEFT_MIN_WIDTH + RIGHT_MIN_WIDTH) {
        message.error({
          content: t("frame_size.invalid_tips", {
            size: BODY_MIN_HEIGHT + HEADER_MIN_HEIGHT + FOOTER_MIN_HEIGHT,
          }),
        })
        dispatch(
          componentsActions.updateTargetPagePropsReducer({
            pageName: currentPageDisplayName,
            newProps: {
              canvasWidth: BODY_MIN_WIDTH + LEFT_MIN_WIDTH + RIGHT_MIN_WIDTH,
              leftWidth: LEFT_MIN_WIDTH,
              rightWidth: RIGHT_MIN_WIDTH,
            },
          }),
        )
      }
    } else {
      const originalWidth = canvasShape.canvasWidth / (finalCanvasWidth / 100)
      const currentWidth = originalWidth * (canvasWidth / 100)
      if (currentWidth < BODY_MIN_WIDTH + LEFT_MIN_WIDTH + RIGHT_MIN_WIDTH) {
        const minWidth =
          (BODY_MIN_WIDTH + LEFT_MIN_WIDTH + RIGHT_MIN_WIDTH) /
          (originalWidth / 100)
        message.error({
          content: t("frame_size.invalid_tips", {
            size: minWidth.toFixed(0),
          }),
        })
        dispatch(
          componentsActions.updateTargetPagePropsReducer({
            pageName: currentPageDisplayName,
            newProps: {
              canvasWidth: minWidth,
            },
          }),
        )
      }
    }
  }, [
    canvasShape.canvasWidth,
    canvasSize,
    canvasWidth,
    currentPageDisplayName,
    dispatch,
    finalCanvasWidth,
    message,
    t,
  ])

  return (
    <PanelBar title={t("editor.page.panel_bar_title.frame")}>
      <LeftAndRightLayout>
        <RadioGroup
          type="button"
          options={canvasSizeOptions}
          value={finalCanvasSize}
          w="100%"
          colorScheme="grayBlue"
          onChange={handleUpdateFrameSize}
        />
      </LeftAndRightLayout>
      <LeftAndRightLayout>
        <PageLabel
          labelName={widthI18n}
          size="big"
          tooltip={
            finalCanvasSize !== "fixed"
              ? t("editor.page.tooltips.auto_canvas_width")
              : undefined
          }
        />
        <SetterPadding>
          <InputNumber
            w="96px"
            value={finalCanvasWidth.toFixed(0)}
            borderColor="techPurple"
            onChange={handleChangeCanvasWidth}
            onBlur={handleBlurCanvasWidth}
          />
        </SetterPadding>
      </LeftAndRightLayout>
      <PanelDivider />
      <LeftAndRightLayout>
        <PageLabel labelName={t("editor.page.label_name.preset")} size="big" />
        <SetterPadding>
          <LayoutSelect
            value={layout}
            currentPageName={currentPageDisplayName}
          />
        </SetterPadding>
      </LeftAndRightLayout>
      <PanelDivider />
      <div css={groupWrapperStyle}>
        <LeftAndRightLayout>
          <PageLabel
            labelName={t("editor.page.label_name.left_panel")}
            size="big"
          />
          <SetterPadding>
            <PanelActionBar
              isFixed={isLeftFixed}
              hasPanel={hasLeft}
              deletePanelAction={() => {
                handleDeleteSection("leftSection", {
                  hasLeft: false,
                  leftWidth: 0,
                  leftPosition: "NONE",
                  layout: "Custom",
                })
              }}
              addPanelAction={() => {
                handleAddSection("leftSection", {
                  hasLeft: true,
                  leftWidth: 20,
                  leftPosition: "FULL",
                  layout: "Custom",
                })
              }}
            />
          </SetterPadding>
        </LeftAndRightLayout>
        {hasLeft && (
          <>
            <LeftAndRightLayout>
              <PageLabel labelName={widthI18n} size="small" />
              <SetterPadding>
                <InputNumber
                  w="96px"
                  value={leftWidth.toFixed(0)}
                  borderColor="techPurple"
                  onChange={handleUpdateLeftPanelWidth}
                  step={1}
                />
              </SetterPadding>
            </LeftAndRightLayout>
            <LeftAndRightLayout>
              <PageLabel
                labelName={t("editor.page.label_name.show_fold_icon")}
                size="small"
                tooltip={t("editor.page.tooltips.show_fold_icon")}
              />
              <SetterPadding>
                <Switch
                  checked={showLeftFoldIcon}
                  onChange={(value) => {
                    handleUpdateShowFoldIcon(value, "leftSection")
                  }}
                  colorScheme="techPurple"
                />
              </SetterPadding>
            </LeftAndRightLayout>
          </>
        )}
      </div>
      <PanelDivider hasMargin={false} />
      <div css={groupWrapperStyle}>
        <LeftAndRightLayout>
          <PageLabel
            labelName={t("editor.page.label_name.right_panel")}
            size="big"
          />
          <SetterPadding>
            <PanelActionBar
              isFixed={isRightFixed}
              hasPanel={hasRight}
              deletePanelAction={() => {
                handleDeleteSection("rightSection", {
                  hasRight: false,
                  rightWidth: 0,
                  rightPosition: "NONE",
                  layout: "Custom",
                })
              }}
              addPanelAction={() => {
                handleAddSection("rightSection", {
                  hasRight: true,
                  rightWidth: 20,
                  rightPosition: "FULL",
                  layout: "Custom",
                })
              }}
            />
          </SetterPadding>
        </LeftAndRightLayout>
        {hasRight && (
          <>
            <LeftAndRightLayout>
              <PageLabel labelName={widthI18n} size="small" />
              <SetterPadding>
                <InputNumber
                  w="96px"
                  value={rightWidth.toFixed(0)}
                  borderColor="techPurple"
                  onChange={handleUpdateRightPanelWidth}
                  step={1}
                />
              </SetterPadding>
            </LeftAndRightLayout>
            <LeftAndRightLayout>
              <PageLabel
                labelName={t("editor.page.label_name.show_fold_icon")}
                size="small"
                tooltip={t("editor.page.tooltips.show_fold_icon")}
              />
              <SetterPadding>
                <Switch
                  checked={showRightFoldIcon}
                  onChange={(value) => {
                    handleUpdateShowFoldIcon(value, "rightSection")
                  }}
                  colorScheme="techPurple"
                />
              </SetterPadding>
            </LeftAndRightLayout>
          </>
        )}
      </div>

      <PanelDivider hasMargin={false} />
      <div css={groupWrapperStyle}>
        <LeftAndRightLayout>
          <PageLabel labelName={t("editor.page.label_name.body")} size="big" />
        </LeftAndRightLayout>
        <LeftAndRightLayout>
          <PageLabel labelName={widthI18n} size="small" />
          <SetterPadding>
            <InputNumber
              w="96px"
              borderColor="techPurple"
              value={bodyWidth.toFixed(0)}
              onChange={handleUpdateBodyPanelWidth}
              step={1}
              disabled={!hasLeft && !hasRight}
            />
          </SetterPadding>
        </LeftAndRightLayout>
      </div>
      <PanelDivider hasMargin={false} />
      <div css={groupWrapperStyle}>
        <LeftAndRightLayout>
          <PageLabel
            labelName={t("editor.page.label_name.header")}
            size="big"
          />
          <SetterPadding>
            <PanelActionBar
              isFixed={isHeaderFixed}
              hasPanel={hasHeader}
              deletePanelAction={() => {
                handleDeleteSection("headerSection", {
                  hasHeader: false,
                  topHeight: 0,
                  layout: "Custom",
                })
              }}
              addPanelAction={() => {
                handleAddSection("headerSection", {
                  hasHeader: true,
                  topHeight: 96,
                  layout: "Custom",
                })
              }}
            />
          </SetterPadding>
        </LeftAndRightLayout>
        {hasHeader && (
          <LeftAndRightLayout>
            <PageLabel
              labelName={`${t("editor.page.label_name.height")}(px)`}
              size="small"
            />
            <SetterPadding>
              <InputNumber
                w="96px"
                value={topHeight}
                borderColor="techPurple"
                onChange={handleUpdateHeaderPanelWidth}
                step={1}
              />
            </SetterPadding>
          </LeftAndRightLayout>
        )}
      </div>
      <PanelDivider hasMargin={false} />
      <div css={groupWrapperStyle}>
        <LeftAndRightLayout>
          <PageLabel
            labelName={t("editor.page.label_name.footer")}
            size="big"
          />
          <SetterPadding>
            <PanelActionBar
              isFixed={isFooterFixed}
              hasPanel={hasFooter}
              deletePanelAction={() => {
                handleDeleteSection("footerSection", {
                  hasFooter: false,
                  bottomHeight: 0,
                  layout: "Custom",
                })
              }}
              addPanelAction={() => {
                handleAddSection("footerSection", {
                  hasFooter: true,
                  bottomHeight: 96,
                  layout: "Custom",
                })
              }}
            />
          </SetterPadding>
        </LeftAndRightLayout>
        {hasFooter && (
          <LeftAndRightLayout>
            <PageLabel
              labelName={`${t("editor.page.label_name.height")}(px)`}
              size="small"
            />
            <SetterPadding>
              <InputNumber
                w="96px"
                value={bottomHeight}
                borderColor="techPurple"
                onChange={handleUpdateFooterPanelWidth}
                step={1}
              />
            </SetterPadding>
          </LeftAndRightLayout>
        )}
      </div>
    </PanelBar>
  )
}

PageFrame.displayName = "PageFrame"
