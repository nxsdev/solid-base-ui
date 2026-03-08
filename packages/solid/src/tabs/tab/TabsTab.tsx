import { Dynamic } from "../../internal/Dynamic";
import { createEffect, createMemo, type JSX, type ValidComponent } from "solid-js";
import { ACTIVE_COMPOSITE_ITEM } from "../../composite/constants";
import { IndexGuessBehavior, useCompositeItem } from "../../composite/item/useCompositeItem";
import { combinePropsList } from "../../merge-props/combineProps";
import { useButton } from "../../use-button";
import type { ButtonPropsForUseButton } from "../../use-button";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { resolveBoolean } from "../../utils/resolveBoolean";
import type { TabsRoot } from "../root/TabsRoot";
import { useTabsRootContext } from "../root/TabsRootContext";
import { useTabsListContext } from "../list/TabsListContext";
import { createTabsChangeEventDetails } from "../createTabsChangeEventDetails";

/**
 * An individual interactive tab button.
 */
export function TabsTab(props: TabsTab.Props) {
  const rootContext = useTabsRootContext();
  const listContext = useTabsListContext();

  const generatedId = useBaseUiId();
  const id = createMemo(() => {
    if (typeof props.id === "string" && props.id !== "") {
      return props.id;
    }

    return generatedId;
  });

  const disabled = createMemo(() => resolveBoolean(props.disabled, false));
  const nativeButton = createMemo(() => resolveBoolean(props.nativeButton, true));
  const active = createMemo(() => isSameValue(props.value, rootContext.value()));

  const tabMetadata: TabsTab.Metadata = {
    get disabled() {
      return disabled();
    },
    get id() {
      return id();
    },
    get value() {
      return props.value;
    },
  };

  const { compositeProps, compositeRef, index } = useCompositeItem<HTMLElement>({
    metadata: tabMetadata,
    indexGuessBehavior: IndexGuessBehavior.GuessFromOrder,
  });

  createEffect(
    () => [active(), index(), listContext.highlightedTabIndex(), disabled()] as const,
    ([isActive, tabIndex, highlightedTabIndex, isDisabled]) => {
      if (isActive && tabIndex > -1 && highlightedTabIndex !== tabIndex && !isDisabled) {
        listContext.setHighlightedTabIndex(tabIndex);
      }
    },
  );

  const { getButtonProps, buttonRef } = useButton<HTMLElement>({
    disabled,
    native: nativeButton,
    focusableWhenDisabled: true,
    composite: true,
  });

  const component = createMemo<ValidComponent>(() => {
    if (props.render !== undefined) {
      return props.render;
    }

    return nativeButton() ? "button" : "span";
  });

  const internalProps = createMemo<ButtonPropsForUseButton<HTMLElement>>(() => ({
    role: "tab",
    id: id(),
    "aria-controls": rootContext.getTabPanelIdByValue(props.value),
    "aria-selected": active() ? "true" : "false",
    [ACTIVE_COMPOSITE_ITEM]: active() ? "" : undefined,
    onClick(
      event: MouseEvent & {
        currentTarget: HTMLElement;
        target: EventTarget & Element;
      },
    ) {
      if (active() || disabled()) {
        return;
      }

      listContext.onTabActivation(
        props.value,
        createTabsChangeEventDetails(event, event.currentTarget, "none"),
      );
    },
    onFocus(
      event: FocusEvent & {
        currentTarget: HTMLElement;
        target: EventTarget & Element;
      },
    ) {
      if (index() > -1 && !disabled()) {
        listContext.setHighlightedTabIndex(index());
      }

      if (disabled()) {
        return;
      }

      if (listContext.activateOnFocus() && !active()) {
        listContext.onTabActivation(
          props.value,
          createTabsChangeEventDetails(event, event.currentTarget, "none"),
        );
      }
    },
    onKeyDown(
      event: KeyboardEvent & {
        currentTarget: HTMLElement;
        target: EventTarget & Element;
      },
    ) {
      if (event.defaultPrevented || disabled() || active()) {
        return;
      }

      if (event.key !== "Enter") {
        return;
      }

      listContext.onTabActivation(
        props.value,
        createTabsChangeEventDetails(event, event.currentTarget, "none"),
      );
    },
  }));

  const elementProps = createMemo<ButtonPropsForUseButton<HTMLElement>>(() => {
    const {
      children: _children,
      value: _value,
      disabled: _disabled,
      nativeButton: _nativeButton,
      render: _render,
      ref: _ref,
      ...rest
    } = props;
    void _children;
    void _value;
    void _disabled;
    void _nativeButton;
    void _render;
    void _ref;
    return rest;
  });

  const buttonProps = createMemo(() => {
    const mergedProps = combinePropsList<HTMLElement>([
      compositeProps(),
      internalProps(),
      elementProps(),
    ]);
    const { role, tabindex, ...otherMergedProps } = mergedProps;
    const resolvedTabIndex =
      typeof tabindex === "number" || typeof tabindex === "string" ? tabindex : undefined;

    return getButtonProps({
      ...otherMergedProps,
      role: typeof role === "string" ? role : undefined,
      tabindex: resolvedTabIndex,
      disabled: disabled(),
    });
  });

  const handleRef: JSX.Ref<HTMLElement> = (node) => {
    compositeRef(node);
    buttonRef(node);

    if (typeof props.ref === "function") {
      props.ref(node);
    }
  };

  return (
    <Dynamic
      component={component()}
      ref={handleRef}
      data-orientation={rootContext.orientation()}
      data-activation-direction={rootContext.tabActivationDirection()}
      data-disabled={disabled() ? "" : undefined}
      data-active={active() ? "" : undefined}
      {...buttonProps()}
    >
      {props.children}
    </Dynamic>
  );
}

export type TabsTabValue = unknown | null;

export type TabsTabActivationDirection = "left" | "right" | "up" | "down" | "none";

export interface TabsTabMetadata extends Record<string, unknown> {
  disabled: boolean;
  id: string | undefined;
  value: TabsTab.Value;
}

export interface TabsTabState {
  disabled: boolean;
  active: boolean;
  orientation: TabsRoot.Orientation;
}

export interface TabsTabProps extends Omit<ButtonPropsForUseButton<HTMLElement>, "disabled"> {
  value: TabsTab.Value;
  disabled?: boolean | undefined;
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace TabsTab {
  export type Value = TabsTabValue;
  export type ActivationDirection = TabsTabActivationDirection;
  export type Metadata = TabsTabMetadata;
  export type State = TabsTabState;
  export type Props = TabsTabProps;
}

function isSameValue(a: TabsTabValue, b: TabsTabValue): boolean {
  return Object.is(a, b);
}
