import { atom } from 'jotai'

export type ProfileOption = {
    label: string
    value: string
}

/** 模拟配置列表，后续接入真实配置管理逻辑时可直接替换数据来源。 */
const initialProfileOptions: ProfileOption[] = [
    { label: '默认配置', value: 'default' },
    { label: '开发板配置', value: 'dev-board' },
    { label: '量产配置', value: 'factory' },
]

/** 生成新的模拟配置，后续接入真实数据源时可替换为创建接口返回值。 */
export function createMockProfile(nextIndex: number): ProfileOption {
    return {
        label: `新配置 ${nextIndex}`,
        value: `mock-profile-${nextIndex}`,
    }
}

/** 存储自动烧录开关状态，供标题栏等多处界面读取。 */
export const autoFlashEnabledAtom = atom(false)

/** 存储配置列表，避免通过 context 在多个组件之间传递。 */
export const profileOptionsAtom = atom<ProfileOption[]>(initialProfileOptions)

/** 存储当前选中的配置项。 */
export const selectedProfileAtom = atom(initialProfileOptions[0]?.value ?? '')