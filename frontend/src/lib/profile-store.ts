import { atom } from 'jotai'

export type ProfileOption = {
    label: string
    running: boolean
    value: string
}

/** 模拟配置列表，后续接入真实配置管理逻辑时可直接替换数据来源。 */
const initialProfileOptions: ProfileOption[] = [
    { label: '默认配置', running: false, value: 'default' },
    { label: '开发板配置', running: false, value: 'dev-board' },
    { label: '量产配置', running: false, value: 'factory' },
]

/** 生成新的模拟配置，后续接入真实数据源时可替换为创建接口返回值。 */
export function createMockProfile(nextIndex: number): ProfileOption {
    return {
        label: `新配置 ${nextIndex}`,
        running: false,
        value: `mock-profile-${nextIndex}`,
    }
}

/** 存储配置列表，避免通过 context 在多个组件之间传递。 */
export const profileOptionsAtom = atom<ProfileOption[]>(initialProfileOptions)

/** 存储当前选中的配置项。 */
export const selectedProfileAtom = atom(initialProfileOptions[0]?.value ?? '')

/** 基于当前选中配置读写运行中状态，保证标题栏开关始终反映当前配置。 */
export const selectedProfileRunningAtom = atom(
    (get) => {
        const profileOptions = get(profileOptionsAtom)
        const selectedProfile = get(selectedProfileAtom)

        return profileOptions.find((option) => option.value === selectedProfile)?.running ?? false
    },
    (get, set, nextRunning: boolean) => {
        const selectedProfile = get(selectedProfileAtom)

        set(profileOptionsAtom, (currentOptions) =>
            currentOptions.map((option) =>
                option.value === selectedProfile
                    ? { ...option, running: nextRunning }
                    : option
            )
        )
    }
)