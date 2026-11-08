// Generated from tokens.json by `npm run tokens`. Do not edit by hand.
//
// Deernova 的 SwiftUI 设计变量。把这个文件加进 App target 即可使用，不需要 Asset Catalog。
// 颜色跟随浅色 / 深色外观；尺寸在 macOS 上是 desktop 密度，在 iOS 和 iPadOS 上是 touch 密度。
// macOS 的侧边栏、工具栏、菜单用系统控件和系统尺寸；这里的尺寸用于自己画的内容区。

import SwiftUI
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

extension Color {
    fileprivate init(deernovaLight light: UInt32, _ lightAlpha: Double, dark: UInt32, _ darkAlpha: Double) {
        func components(_ hex: UInt32) -> (Double, Double, Double) {
            (Double((hex >> 16) & 0xFF) / 255, Double((hex >> 8) & 0xFF) / 255, Double(hex & 0xFF) / 255)
        }
        #if canImport(UIKit)
        self.init(uiColor: UIColor { traits in
            let (hex, alpha) = traits.userInterfaceStyle == .dark ? (dark, darkAlpha) : (light, lightAlpha)
            let (r, g, b) = components(hex)
            return UIColor(red: r, green: g, blue: b, alpha: alpha)
        })
        #elseif canImport(AppKit)
        self.init(nsColor: NSColor(name: nil) { appearance in
            let isDark = appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
            let (hex, alpha) = isDark ? (dark, darkAlpha) : (light, lightAlpha)
            let (r, g, b) = components(hex)
            return NSColor(srgbRed: r, green: g, blue: b, alpha: alpha)
        })
        #endif
    }
}

/// 语义颜色。accent 命名为 brandAccent，避开系统的 accentColor。
public enum DeernovaColor {
    /// 窗口底色、Web 应用的内容区、分组列表的底色。最底层的纸面。
    public static let canvas = Color(deernovaLight: 0xF5F5F5, 1, dark: 0x171717, 1)
    /// 卡片、侧边栏（比内容区亮一层）。
    public static let surface = Color(deernovaLight: 0xFAFAFA, 1, dark: 0x1C1C1C, 1)
    /// 输入框、Composer、用户消息气泡、分组列表、弹出层。最亮的纸面。
    public static let surfaceRaised = Color(deernovaLight: 0xFFFFFF, 1, dark: 0x252525, 1)
    /// 代码块、展开的步骤详情。凹下去的纸面。
    public static let surfaceSunken = Color(deernovaLight: 0xEBEBEB, 1, dark: 0x111111, 1)
    /// 正文与标题，在四种纸面上不低于 13:1。
    public static let ink = Color(deernovaLight: 0x171717, 1, dark: 0xEDEDED, 1)
    /// 次要文字、说明、列表的值、未选中的图标，在四种纸面上不低于 6:1。
    public static let inkSecondary = Color(deernovaLight: 0x525252, 1, dark: 0xA3A3A3, 1)
    /// 占位符、时间戳、计数、分组标题，在四种纸面上不低于 4.5:1。
    public static let inkTertiary = Color(deernovaLight: 0x666666, 1, dark: 0x8C8C8C, 1)
    /// 分隔线、卡片描边、按钮描边。装饰性，不承载信息。
    public static let line = Color(deernovaLight: 0xE3E3E3, 1, dark: 0x2F2F2F, 1)
    /// 需要明确边界的自绘控件、拖拽条、链接下划线。在 canvas、surface、surface-raised 上不低于 3:1；普通输入框用底色区分，不用它描边。
    public static let lineControl = Color(deernovaLight: 0x8A8A8A, 1, dark: 0x737373, 1)
    public static let brandAccent = ink
    /// 强调的浅底：列表图标底。上面的文字用 ink；不用作输入框的聚焦外圈。
    public static let accentSoft = Color(deernovaLight: 0xE8E8E8, 1, dark: 0x2F2F2F, 1)
    /// accent 填充上的文字和图标：浅色主题白字，深色主题黑字。
    public static let onAccent = Color(deernovaLight: 0xFFFFFF, 1, dark: 0x171717, 1)
    /// 仅兼容旧版焦点环。新界面不用这个 token 描边；输入框聚焦不变，键盘导航用底色或文字提示。
    public static let focusRing = Color(deernovaLight: 0x737373, 1, dark: 0xA3A3A3, 1)
    /// 成功、已完成、已同步、开关打开。作为文字用在纸面和 success-soft 上。
    public static let success = Color(deernovaLight: 0x1F6B66, 1, dark: 0x6CC3B4, 1)
    /// 成功状态的浅底（标签、横幅）。
    public static let successSoft = Color(deernovaLight: 0xDDEEEC, 1, dark: 0x183230, 1)
    /// 需要注意但不阻断：额度将用完、网络较慢。
    public static let warning = Color(deernovaLight: 0x8A5A0B, 1, dark: 0xE2B054, 1)
    /// 警告状态的浅底。
    public static let warningSoft = Color(deernovaLight: 0xF5EAD3, 1, dark: 0x3A2E17, 1)
    /// 错误、失败、删除。永远同时配图标或文字。
    public static let danger = Color(deernovaLight: 0xB0283F, 1, dark: 0xF07A8A, 1)
    /// 错误状态的浅底、危险按钮的底色。
    public static let dangerSoft = Color(deernovaLight: 0xF7E1E4, 1, dark: 0x3D2027, 1)
    /// 中性提示。
    public static let info = Color(deernovaLight: 0x2C5F86, 1, dark: 0x82B4DC, 1)
    /// 提示状态的浅底。
    public static let infoSoft = Color(deernovaLight: 0xE1EBF3, 1, dark: 0x1D2C3A, 1)
    /// 悬停底色，叠在任何纸面上（列表行、文字按钮、侧边栏项）。
    public static let fillHover = Color(deernovaLight: 0x000000, 0.039, dark: 0xFFFFFF, 0.059)
    /// 选中底色：侧边栏当前项、分段控件底槽、次按钮、中性标签底。比悬停明显，一眼能看出当前在哪。
    public static let fillSelected = Color(deernovaLight: 0x000000, 0.09, dark: 0xFFFFFF, 0.149)
    /// 开关的圆钮，两套主题都是白色，与系统一致。
    public static let knob = Color(deernovaLight: 0xFFFFFF, 1, dark: 0xFFFFFF, 1)
    /// 弹窗背后压暗内容的遮罩。
    public static let scrim = Color(deernovaLight: 0x000000, 0.322, dark: 0x000000, 0.502)
}

/// 让 .foregroundStyle(.inkSecondary)、.background(.surface, in: …) 直接可用。
public extension ShapeStyle where Self == Color {
    static var canvas: Color { DeernovaColor.canvas }
    static var surface: Color { DeernovaColor.surface }
    static var surfaceRaised: Color { DeernovaColor.surfaceRaised }
    static var surfaceSunken: Color { DeernovaColor.surfaceSunken }
    static var ink: Color { DeernovaColor.ink }
    static var inkSecondary: Color { DeernovaColor.inkSecondary }
    static var inkTertiary: Color { DeernovaColor.inkTertiary }
    static var line: Color { DeernovaColor.line }
    static var lineControl: Color { DeernovaColor.lineControl }
    static var brandAccent: Color { DeernovaColor.brandAccent }
    static var accentSoft: Color { DeernovaColor.accentSoft }
    static var onAccent: Color { DeernovaColor.onAccent }
    static var focusRing: Color { DeernovaColor.focusRing }
    static var success: Color { DeernovaColor.success }
    static var successSoft: Color { DeernovaColor.successSoft }
    static var warning: Color { DeernovaColor.warning }
    static var warningSoft: Color { DeernovaColor.warningSoft }
    static var danger: Color { DeernovaColor.danger }
    static var dangerSoft: Color { DeernovaColor.dangerSoft }
    static var info: Color { DeernovaColor.info }
    static var infoSoft: Color { DeernovaColor.infoSoft }
    static var fillHover: Color { DeernovaColor.fillHover }
    static var fillSelected: Color { DeernovaColor.fillSelected }
    static var knob: Color { DeernovaColor.knob }
    static var scrim: Color { DeernovaColor.scrim }
}

/// 尺寸、间距、圆角、时长。
public enum Deernova {
    /// 图标与文字之间、标题与摘要之间。
    public static let space1: CGFloat = 4
    /// 列表项内边距、横幅上下内边距、卡片网格间距。
    public static let space2: CGFloat = 8
    /// 卡片内边距、横幅左右内边距。
    public static let space3: CGFloat = 12
    /// 内容区里段落、工具调用行、卡片之间。
    public static let space4: CGFloat = 16
    /// 分组之间、区块之间。
    public static let space5: CGFloat = 20
    /// 空状态内边距、大区块之间。
    public static let space6: CGFloat = 24
    /// 页面级留白。
    public static let space8: CGFloat = 32
    /// 引导页、首屏的留白。
    public static let space10: CGFloat = 40
    /// 官网与文档的章节间距。
    public static let space12: CGFloat = 48
    /// 官网首屏的上下留白。
    public static let space16: CGFloat = 64
    /// 标签、复选框、小按钮。
    public static let radiusXs: CGFloat = 4
    /// 桌面端的按钮、输入框、工具栏图标按钮。
    public static let radiusSm: CGFloat = 6
    /// 侧边栏选中块、代码块、弹出菜单。
    public static let radiusMd: CGFloat = 8
    /// 卡片、用户消息气泡、分组列表、任务清单。
    public static let radiusLg: CGFloat = 12
    /// 底部弹窗、触控端单行 Composer。
    public static let radiusXl: CGFloat = 24
    /// 胶囊与圆形：触控端按钮、玻璃按钮、状态圆点。
    public static let radiusFull: CGFloat = 999
    /// 分隔线、卡片、输入区、侧边栏和顶栏的边线。SwiftUI 里自己画的边框用 1pt，系统自带的分隔线保持系统样式。
    public static let strokeLine: CGFloat = 1
    /// 确实需要边界的控件描边；普通输入框、下拉框和激活态不画深色边框。
    public static let strokeControl: CGFloat = 1
    /// 仅兼容旧版焦点环宽度，新界面不使用环形描边。
    public static let strokeFocus: CGFloat = 2
    /// 仅兼容旧版焦点环偏移，新界面不使用环形描边。
    public static let focusOffset: CGFloat = 2
    /// 悬停、按压、选中这类即时反馈；tooltip 的进出；菜单、popover 的退出。
    public static let durationInstant: Double = 0.12
    /// 菜单、popover、轻提示的进入；展开收起；弹窗和抽屉的退出。
    public static let durationBase: Double = 0.2
    /// 弹窗、底部弹窗、侧边抽屉的进入，页面级转场。
    public static let durationSlow: Double = 0.32
    /// 禁用的控件。禁用时保持原位，不隐藏。
    public static let opacityDisabled: Double = 0.35
    /// 实色（accent 填充）按钮悬停和按下。
    public static let opacitySolidHover: Double = 0.88
    /// 对话栏和长文阅读栏的最大宽度。
    public static let contentMax: CGFloat = 680
    /// 表单页、设置页内容栏的最大宽度。
    public static let formMax: CGFloat = 560
    /// 表格、看板和官网内容的最大宽度。
    public static let wideMax: CGFloat = 1120
    /// 文件附件条的最大宽度，文件名放不下时中间省略。
    public static let composerAttachmentMaxWidth: CGFloat = 240
    /// 菜单最大宽度；放不下的文字用省略号。
    public static let menuMaxWidth: CGFloat = 320
    /// 底部弹窗顶部拖拽条的宽度。
    public static let sheetGrabberWidth: CGFloat = 36
    /// 拖拽条的高度。
    public static let sheetGrabberHeight: CGFloat = 5
    /// tooltip 和触发它的控件之间的距离。
    public static let tooltipOffset: CGFloat = 8
    /// tooltip 最大宽度，超过时折行，最多两行。
    public static let tooltipMaxWidth: CGFloat = 240

    // 按密度取值的尺寸：macOS 是 desktop（只用于自己画的内容区），iOS 和 iPadOS 是 touch。
    #if os(macOS)
    public static let gapInline: CGFloat = 6
    public static let gapStack: CGFloat = 8
    public static let gapGroup: CGFloat = 24
    public static let pageMargin: CGFloat = 32
    public static let hitMin: CGFloat = 24
    public static let sidebarWidth: CGFloat = 288
    public static let sidebarWidthMin: CGFloat = 200
    public static let sidebarWidthMax: CGFloat = 400
    public static let paneWidth: CGFloat = 320
    public static let toolbarHeight: CGFloat = 44
    public static let gridGutter: CGFloat = 24
    public static let buttonHeightSm: CGFloat = 24
    public static let buttonHeightMd: CGFloat = 28
    public static let buttonHeightLg: CGFloat = 32
    public static let buttonPaddingXSm: CGFloat = 8
    public static let buttonPaddingXMd: CGFloat = 12
    public static let buttonPaddingXLg: CGFloat = 16
    public static let buttonFontSizeSm: CGFloat = 12
    public static let buttonFontSizeMd: CGFloat = 14
    public static let buttonFontSizeLg: CGFloat = 14
    public static let buttonFontWeight: Int = 500
    public static let buttonRadius: CGFloat = 6
    public static let buttonRadiusSm: CGFloat = 4
    public static let toolbarTitleSize: CGFloat = 15
    public static let panelTabHeight: CGFloat = 28
    public static let glassButtonSize: CGFloat = 34
    public static let segmentedHeight: CGFloat = 24
    public static let segmentedPadding: CGFloat = 2
    public static let segmentedPaddingX: CGFloat = 12
    public static let segmentedFontSize: CGFloat = 13
    public static let segmentedRadius: CGFloat = 6
    public static let fieldHeight: CGFloat = 28
    public static let fieldPaddingX: CGFloat = 10
    public static let fieldFontSize: CGFloat = 14
    public static let fieldRadius: CGFloat = 6
    public static let fieldActionSize: CGFloat = 20
    public static let composerRadius: CGFloat = 14
    public static let composerMinHeight: CGFloat = 44
    public static let composerThumbSize: CGFloat = 48
    public static let rowHeight: CGFloat = 32
    public static let rowPaddingX: CGFloat = 10
    public static let rowRadius: CGFloat = 8
    public static let rowGap: CGFloat = 2
    public static let rowIconSize: CGFloat = 20
    public static let switchWidth: CGFloat = 36
    public static let switchHeight: CGFloat = 20
    public static let cardPaddingX: CGFloat = 16
    public static let cardPaddingY: CGFloat = 12
    public static let cardRadius: CGFloat = 12
    public static let cardGap: CGFloat = 12
    public static let tagHeight: CGFloat = 20
    public static let tagPaddingX: CGFloat = 6
    public static let tagFontSize: CGFloat = 12
    public static let tagRadius: CGFloat = 4
    public static let codeHeaderHeight: CGFloat = 32
    public static let taskRowHeight: CGFloat = 28
    public static let taskGlyphSize: CGFloat = 16
    public static let emptyTitleSize: CGFloat = 24
    public static let emptyIconSize: CGFloat = 32
    public static let toastHeight: CGFloat = 36
    public static let bannerRadius: CGFloat = 10
    public static let menuItemHeight: CGFloat = 28
    public static let menuItemPaddingX: CGFloat = 8
    public static let menuFontSize: CGFloat = 14
    public static let menuPadding: CGFloat = 4
    public static let menuRadius: CGFloat = 8
    public static let menuOffset: CGFloat = 4
    public static let menuMinWidth: CGFloat = 160
    public static let sheetWidthSm: CGFloat = 360
    public static let sheetWidthMd: CGFloat = 480
    public static let sheetWidthLg: CGFloat = 720
    public static let sheetPadding: CGFloat = 20
    public static let sheetMargin: CGFloat = 32
    public static let sheetRadius: CGFloat = 12
    public static let popoverPadding: CGFloat = 12
    public static let tooltipHeight: CGFloat = 24
    public static let tooltipPaddingX: CGFloat = 8
    public static let tooltipFontSize: CGFloat = 12
    public static let tooltipRadius: CGFloat = 6
    public static let messageFontSize: CGFloat = 15
    public static let messageActionSize: CGFloat = 24
    public static let iconSizeSm: CGFloat = 14
    public static let iconSizeMd: CGFloat = 16
    public static let iconSizeLg: CGFloat = 20
    #else
    public static let gapInline: CGFloat = 6
    public static let gapStack: CGFloat = 8
    public static let gapGroup: CGFloat = 20
    public static let pageMargin: CGFloat = 16
    public static let hitMin: CGFloat = 44
    public static let sidebarWidth: CGFloat = 320
    public static let sidebarWidthMin: CGFloat = 260
    public static let sidebarWidthMax: CGFloat = 400
    public static let paneWidth: CGFloat = 360
    public static let toolbarHeight: CGFloat = 44
    public static let gridGutter: CGFloat = 16
    public static let buttonHeightSm: CGFloat = 30
    public static let buttonHeightMd: CGFloat = 36
    public static let buttonHeightLg: CGFloat = 46
    public static let buttonPaddingXSm: CGFloat = 12
    public static let buttonPaddingXMd: CGFloat = 16
    public static let buttonPaddingXLg: CGFloat = 20
    public static let buttonFontSizeSm: CGFloat = 13
    public static let buttonFontSizeMd: CGFloat = 15
    public static let buttonFontSizeLg: CGFloat = 16
    public static let buttonFontWeight: Int = 600
    public static let buttonRadius: CGFloat = 999
    public static let buttonRadiusSm: CGFloat = 999
    public static let toolbarTitleSize: CGFloat = 17
    public static let panelTabHeight: CGFloat = 36
    public static let glassButtonSize: CGFloat = 44
    public static let segmentedHeight: CGFloat = 28
    public static let segmentedPadding: CGFloat = 2
    public static let segmentedPaddingX: CGFloat = 16
    public static let segmentedFontSize: CGFloat = 14
    public static let segmentedRadius: CGFloat = 999
    public static let fieldHeight: CGFloat = 44
    public static let fieldPaddingX: CGFloat = 12
    public static let fieldFontSize: CGFloat = 17
    public static let fieldRadius: CGFloat = 8
    public static let fieldActionSize: CGFloat = 32
    public static let composerRadius: CGFloat = 24
    public static let composerMinHeight: CGFloat = 44
    public static let composerThumbSize: CGFloat = 56
    public static let rowHeight: CGFloat = 44
    public static let rowPaddingX: CGFloat = 16
    public static let rowRadius: CGFloat = 10
    public static let rowGap: CGFloat = 0
    public static let rowIconSize: CGFloat = 28
    public static let switchWidth: CGFloat = 51
    public static let switchHeight: CGFloat = 31
    public static let cardPaddingX: CGFloat = 16
    public static let cardPaddingY: CGFloat = 14
    public static let cardRadius: CGFloat = 12
    public static let cardGap: CGFloat = 12
    public static let tagHeight: CGFloat = 22
    public static let tagPaddingX: CGFloat = 8
    public static let tagFontSize: CGFloat = 12
    public static let tagRadius: CGFloat = 999
    public static let codeHeaderHeight: CGFloat = 36
    public static let taskRowHeight: CGFloat = 44
    public static let taskGlyphSize: CGFloat = 20
    public static let emptyTitleSize: CGFloat = 20
    public static let emptyIconSize: CGFloat = 36
    public static let toastHeight: CGFloat = 40
    public static let bannerRadius: CGFloat = 12
    public static let menuItemHeight: CGFloat = 44
    public static let menuItemPaddingX: CGFloat = 10
    public static let menuFontSize: CGFloat = 17
    public static let menuPadding: CGFloat = 6
    public static let menuRadius: CGFloat = 12
    public static let menuOffset: CGFloat = 8
    public static let menuMinWidth: CGFloat = 220
    public static let sheetWidthSm: CGFloat = 360
    public static let sheetWidthMd: CGFloat = 540
    public static let sheetWidthLg: CGFloat = 720
    public static let sheetPadding: CGFloat = 20
    public static let sheetMargin: CGFloat = 8
    public static let sheetRadius: CGFloat = 24
    public static let popoverPadding: CGFloat = 16
    public static let tooltipHeight: CGFloat = 28
    public static let tooltipPaddingX: CGFloat = 10
    public static let tooltipFontSize: CGFloat = 13
    public static let tooltipRadius: CGFloat = 8
    public static let messageFontSize: CGFloat = 15
    public static let messageActionSize: CGFloat = 32
    public static let iconSizeSm: CGFloat = 17
    public static let iconSizeMd: CGFloat = 20
    public static let iconSizeLg: CGFloat = 24
    #endif
}

/// 字体角色。iOS 上是文本样式，支持动态字体。
public extension Font {
    /// 空状态、引导页、页面的大标题（衬线）。每屏最多一个。
    static var deernovaDisplay: Font {
        #if os(macOS)
        .system(size: 26, weight: .semibold, design: .serif)
        #else
        .system(.largeTitle, design: .serif).weight(.semibold)
        #endif
    }
    /// 文章标题、弹窗标题（衬线）。
    static var deernovaTitle: Font {
        #if os(macOS)
        .system(size: 18, weight: .semibold, design: .serif)
        #else
        .system(.title3, design: .serif).weight(.semibold)
        #endif
    }
    /// 区块标题、卡片标题、横幅标题、列表行标题。
    static var deernovaHeadline: Font {
        #if os(macOS)
        .system(size: 15, weight: .semibold)
        #else
        .headline
        #endif
    }
    /// 界面正文、AI 回答、用户消息、列表、表单。
    static var deernovaBody: Font {
        #if os(macOS)
        .system(size: 15)
        #else
        .body
        #endif
    }
    /// 文章、文档这类长文阅读（衬线）。AI 回答不用它。
    static var deernovaProse: Font {
        #if os(macOS)
        .system(size: 16, design: .serif)
        #else
        .system(.body, design: .serif)
        #endif
    }
    /// 说明文字、弹窗正文、AI 输入框右下方的模型、权限和上下文用量。
    static var deernovaCallout: Font {
        #if os(macOS)
        .system(size: 14)
        #else
        .callout
        #endif
    }
    /// 侧边栏分组标题、分组列表的页头页脚、卡片摘要。
    static var deernovaFootnote: Font {
        #if os(macOS)
        .system(size: 13)
        #else
        .footnote
        #endif
    }
    /// 时间戳、计数、标签。界面里最小的字。
    static var deernovaCaption: Font {
        #if os(macOS)
        .system(size: 12)
        #else
        .caption
        #endif
    }
    /// 代码块、命令、文件路径、需要对齐的数据。
    static var deernovaCode: Font {
        #if os(macOS)
        .system(size: 13, design: .monospaced)
        #else
        .system(.footnote, design: .monospaced)
        #endif
    }
}
