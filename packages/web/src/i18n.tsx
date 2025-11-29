import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'zh'

type Dict = Record<string, string>

const en: Dict = {
  appName: 'secondplanet',
  discover: 'Discover',
  myVillages: 'My Villages',
  dataCenter: 'Data Center',
  totalCitizens: 'Total Citizens',
  activeToday: 'Active Today',
  treasury: 'Treasury',
  constitution: 'Constitution',
  editRules: 'Edit Rules',
  adminSettings: 'Admin Settings',
  privateVillage: 'Private Village',
  privateVillageHint: 'Only invited members can join',
  inviteCode: 'Invite Code',
  transferOwnership: 'Transfer Ownership',
  transferHint: 'Hand over chief role to another member',
  transfer: 'Transfer',
  square: 'Square',
  citizens: 'Citizens',
  events: 'Events',
  townHall: 'Town Hall',
  officialAnnouncement: 'Official Announcement',
  visible: 'Visible',
  hidden: 'Hidden',
  language: 'Language',
  english: 'English',
  chinese: '中文',
  joinByCode: 'Join by Code',
  villageId: 'Village ID',
  enterInviteCode: 'Invite Code',
  joinVillageHint: 'Ask your friend for the village ID and invite code',
  joining: 'Joining...',
  join: 'Join',
  cancel: 'Cancel',
  createVillage: 'Create Village'
}

const zh: Dict = {
  appName: '第二星球',
  discover: '发现',
  myVillages: '我的村落',
  dataCenter: '数据中心',
  totalCitizens: '居民总数',
  activeToday: '今日活跃',
  treasury: '国库',
  constitution: '社区宪章',
  editRules: '编辑规则',
  adminSettings: '管理员设置',
  privateVillage: '私密村落',
  privateVillageHint: '仅受邀成员可加入',
  inviteCode: '邀请码',
  transferOwnership: '转移所有权',
  transferHint: '将首领身份交给其他成员',
  transfer: '转移',
  square: '广场',
  citizens: '居民',
  events: '活动',
  townHall: '议事厅',
  officialAnnouncement: '官方公告',
  visible: '可见',
  hidden: '隐藏',
  language: '语言',
  english: 'English',
  chinese: '中文',
  joinByCode: '邀请码加入',
  villageId: '村落ID',
  enterInviteCode: '邀请码',
  joinVillageHint: '向朋友索要村落ID和邀请码',
  joining: '加入中...',
  join: '加入',
  cancel: '取消',
  createVillage: '创建村落'
}

const DICTS: Record<Lang, Dict> = { en, zh }

const I18nContext = createContext<{ lang: Lang; t: (k: string) => string; setLang: (l: Lang) => void }>({ lang: 'en', t: (k) => k, setLang: () => {} })

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved) {
      setLangState(saved)
    } else {
      const def = navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'
      setLangState(def as Lang)
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  const t = useMemo(() => {
    const d = DICTS[lang]
    return (k: string) => d[k] ?? k
  }, [lang])

  return <I18nContext.Provider value={{ lang, t, setLang }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

