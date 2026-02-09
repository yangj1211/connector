import React, { createContext, useContext, useState, useCallback } from 'react';

/** 全局列语义：表名 -> 列名 -> 语义文案（在数据中心配置，在新建知识库中只读展示） */
export type GlobalColumnSemanticsMap = Record<string, Record<string, string>>;

const GlobalColumnSemanticsContext = createContext<{
  globalColumnSemantics: GlobalColumnSemanticsMap;
  setGlobalColumnSemantics: (updater: (prev: GlobalColumnSemanticsMap) => GlobalColumnSemanticsMap) => void;
} | null>(null);

// 示例全局列语义数据（用于演示）
const INITIAL_GLOBAL_COLUMN_SEMANTICS: GlobalColumnSemanticsMap = {
  jst_flat_table: {
    id: '唯一标识符，用于区分不同的记录',
    revenue: '企业通过销售商品或提供服务获得的收入总额，通常以货币单位表示',
    cost: '企业在生产或提供服务过程中产生的各项成本支出，包括原材料、人工、运营等费用',
    created_at: '记录首次创建的时间戳，用于追踪数据的生成时间',
  },
  revenue_cost: {
    id: '记录的唯一标识，用于数据关联和查询',
    revenue: '营业收入，反映企业主营业务产生的收入金额',
    cost: '营业成本，包括直接成本和间接成本，用于计算利润',
    created_at: '数据记录的创建时间，用于时间序列分析和审计',
  },
  main_companies: {
    company_id: '公司唯一编码，用于系统内部识别和管理',
    company_name: '公司的正式注册名称，用于业务展示和报表',
    status: '公司当前运营状态，如：正常、停业、注销等',
  },
  jinpan_catalog: {
    catalog_id: '目录的唯一标识码，用于分类管理和检索',
    catalog_name: '目录的显示名称，描述目录的业务含义',
    status: '目录的启用状态，控制目录是否在系统中可见和使用',
  },
  dwd_dcp: {
    id: '数据仓库明细层记录的唯一标识',
    name: '业务实体的名称，如产品名称、客户名称等',
    created_at: '明细数据记录的创建时间，用于数据溯源',
  },
  dws_dcp: {
    id: '数据仓库汇总层记录的唯一标识',
    name: '汇总维度的名称，如汇总的产品类别、区域等',
    updated_at: '汇总数据最后更新的时间，反映数据的新鲜度',
  },
  dwd_secrecy: {
    id: '保密数据的唯一标识符',
    name: '保密信息的名称或标题',
  },
};

export function GlobalColumnSemanticsProvider({ children }: { children: React.ReactNode }) {
  const [globalColumnSemantics, setGlobalColumnSemanticsState] = useState<GlobalColumnSemanticsMap>(INITIAL_GLOBAL_COLUMN_SEMANTICS);
  const setGlobalColumnSemantics = useCallback(
    (updater: (prev: GlobalColumnSemanticsMap) => GlobalColumnSemanticsMap) => {
      setGlobalColumnSemanticsState(updater);
    },
    []
  );
  return (
    <GlobalColumnSemanticsContext.Provider value={{ globalColumnSemantics, setGlobalColumnSemantics }}>
      {children}
    </GlobalColumnSemanticsContext.Provider>
  );
}

export function useGlobalColumnSemantics() {
  const ctx = useContext(GlobalColumnSemanticsContext);
  if (!ctx) {
    return {
      globalColumnSemantics: {} as GlobalColumnSemanticsMap,
      setGlobalColumnSemantics: (_: (p: GlobalColumnSemanticsMap) => GlobalColumnSemanticsMap) => {},
    };
  }
  return ctx;
}
