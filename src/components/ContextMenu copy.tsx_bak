import React, { useRef, useEffect } from 'react';
import { Overlay } from 'ol';
import { toLonLat } from 'ol/proj';
import { MdLocationOn, MdChevronRight } from 'react-icons/md';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: string;
  submenu?: MenuItem[];
}

export interface ContextMenuProps {
  visible: boolean;
  position: [number, number];
  menuItems: MenuItem[];
  onAction: (action: string, coordinate: [number, number]) => void;
  onHide: () => void;
  overlay?: Overlay;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  position,
  menuItems,
  onAction,
  onHide,
  overlay
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = React.useState<string | null>(null);

  // 외부 클릭 감지하여 메뉴 숨기기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onHide();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      // 컨텍스트 메뉴 영역 외부에서의 오른쪽 클릭 차단
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
        onHide();
        return false;
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onHide();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside, { capture: true });
      document.addEventListener('contextmenu', handleContextMenu, { capture: true });
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside, { capture: true });
        document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [visible, onHide]);

  // overlay 위치 업데이트
  useEffect(() => {
    if (overlay && menuRef.current) {
      overlay.setElement(menuRef.current);
      if (visible && position) {
        overlay.setPosition(position);
      }
    }
  }, [overlay, visible, position]);

  const handleMenuHover = React.useCallback((menuId: string | null) => {
    setHoveredSubmenu(menuId);
  }, []);

  const handleAction = React.useCallback((action: string) => {
    onAction(action, position);
    onHide();
  }, [onAction, position, onHide]);

  if (!visible) {
    return <div ref={menuRef} style={{ position: 'absolute', opacity: 0, visibility: 'hidden' }} />;
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        padding: '8px 0',
        minWidth: '180px',
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: 'opacity 0.2s ease, visibility 0.2s ease',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
    >
      <div style={{
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#666',
        background: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <MdLocationOn style={{ marginRight: '6px' }} /> 지도 메뉴
      </div>
      {menuItems.map((item) => (
        <div
          key={item.id}
          style={{ position: 'relative' }}
          onMouseEnter={() => item.submenu && handleMenuHover(item.id)}
          onMouseLeave={() => item.submenu && handleMenuHover(null)}
        >
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: item.submenu ? 'space-between' : 'flex-start',
              gap: '8px',
              position: 'relative',
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: hoveredSubmenu === item.id ? '#e3f2fd' : 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: hoveredSubmenu === item.id ? '#1976d2' : '#333',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!hoveredSubmenu || hoveredSubmenu !== item.id) {
                (e.target as HTMLElement).style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (hoveredSubmenu !== item.id) {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
            onClick={() => {
              if (item.action) {
                handleAction(item.action);
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <span style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            </div>
            {item.submenu && (
              <MdChevronRight style={{
                fontSize: '14px',
                transition: 'transform 0.2s ease',
                color: hoveredSubmenu === item.id ? '#1976d2' : '#666',
                transform: hoveredSubmenu === item.id ? 'rotate(90deg)' : 'rotate(0deg)'
              }} />
            )}
          </button>
          {item.submenu && (
            <div style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              minWidth: '160px',
              zIndex: 1001,
              opacity: hoveredSubmenu === item.id ? 1 : 0,
              visibility: hoveredSubmenu === item.id ? 'visible' : 'hidden',
              transform: hoveredSubmenu === item.id ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'all 0.15s ease',
              padding: '4px 0',
              pointerEvents: hoveredSubmenu === item.id ? 'auto' : 'none'
            }}>
              {item.submenu.map((subItem) => (
                <button
                  key={subItem.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#333',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                  onClick={() => subItem.action && handleAction(subItem.action)}
                >
                  <span style={{
                    width: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>{subItem.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{subItem.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;