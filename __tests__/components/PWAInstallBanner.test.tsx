import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PWAInstallBanner from "@/components/PWAInstallBanner";

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// beforeinstallprompt 이벤트 mock
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

describe("PWAInstallBanner", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorageMock.clear();
    // window.matchMedia mock for standalone check
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe("초기 렌더링", () => {
    it("beforeinstallprompt 이벤트가 발생하면 배너를 표시한다", async () => {
      render(<PWAInstallBanner />);

      // 초기에는 배너가 없음
      expect(screen.queryByRole("banner")).not.toBeInTheDocument();

      // beforeinstallprompt 이벤트 발생
      const promptEvent = new Event(
        "beforeinstallprompt"
      ) as BeforeInstallPromptEvent;
      promptEvent.prompt = jest.fn().mockResolvedValue(undefined);
      promptEvent.userChoice = Promise.resolve({ outcome: "dismissed" });

      act(() => {
        window.dispatchEvent(promptEvent);
      });

      // 배너가 표시됨
      expect(await screen.findByRole("banner")).toBeInTheDocument();
      expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument();
    });

    it("이미 설치된 경우(standalone) 배너를 표시하지 않는다", () => {
      // standalone 모드로 설정
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: query === "(display-mode: standalone)",
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<PWAInstallBanner />);

      const promptEvent = new Event(
        "beforeinstallprompt"
      ) as BeforeInstallPromptEvent;
      promptEvent.prompt = jest.fn().mockResolvedValue(undefined);
      promptEvent.userChoice = Promise.resolve({ outcome: "dismissed" });

      act(() => {
        window.dispatchEvent(promptEvent);
      });

      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    });

    it("이전에 닫기를 누른 경우 배너를 표시하지 않는다", () => {
      localStorageMock.setItem("pwa-banner-dismissed", "true");

      render(<PWAInstallBanner />);

      const promptEvent = new Event(
        "beforeinstallprompt"
      ) as BeforeInstallPromptEvent;
      promptEvent.prompt = jest.fn().mockResolvedValue(undefined);
      promptEvent.userChoice = Promise.resolve({ outcome: "dismissed" });

      act(() => {
        window.dispatchEvent(promptEvent);
      });

      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    });
  });

  describe("사용자 상호작용", () => {
    it("X 버튼 클릭 시 배너를 숨기고 localStorage에 저장한다", async () => {
      render(<PWAInstallBanner />);

      const promptEvent = new Event(
        "beforeinstallprompt"
      ) as BeforeInstallPromptEvent;
      promptEvent.prompt = jest.fn().mockResolvedValue(undefined);
      promptEvent.userChoice = Promise.resolve({ outcome: "dismissed" });

      act(() => {
        window.dispatchEvent(promptEvent);
      });

      const banner = await screen.findByRole("banner");
      expect(banner).toBeInTheDocument();

      // X 버튼 클릭
      const closeButton = screen.getByRole("button", { name: /닫기|close/i });
      await user.click(closeButton);

      // 배너가 사라짐
      expect(screen.queryByRole("banner")).not.toBeInTheDocument();

      // localStorage에 저장됨
      expect(localStorageMock.getItem("pwa-banner-dismissed")).toBe("true");
    });

    it("설치 버튼 클릭 시 prompt()를 호출한다", async () => {
      render(<PWAInstallBanner />);

      const mockPrompt = jest.fn().mockResolvedValue(undefined);
      const promptEvent = new Event(
        "beforeinstallprompt"
      ) as BeforeInstallPromptEvent;
      promptEvent.prompt = mockPrompt;
      promptEvent.userChoice = Promise.resolve({ outcome: "accepted" });

      act(() => {
        window.dispatchEvent(promptEvent);
      });

      const installButton = await screen.findByRole("button", {
        name: /설치|install/i,
      });
      await user.click(installButton);

      expect(mockPrompt).toHaveBeenCalled();
    });

    it("설치 완료 후 배너가 사라진다", async () => {
      render(<PWAInstallBanner />);

      const mockPrompt = jest.fn().mockResolvedValue(undefined);
      const promptEvent = new Event(
        "beforeinstallprompt"
      ) as BeforeInstallPromptEvent;
      promptEvent.prompt = mockPrompt;
      promptEvent.userChoice = Promise.resolve({ outcome: "accepted" });

      act(() => {
        window.dispatchEvent(promptEvent);
      });

      const installButton = await screen.findByRole("button", {
        name: /설치|install/i,
      });
      await user.click(installButton);

      // 설치 후 배너 사라짐
      await expect(screen.findByRole("banner")).rejects.toThrow();
    });
  });

  describe("배너 내용", () => {
    it("앱 이름과 설치 안내 메시지를 표시한다", async () => {
      render(<PWAInstallBanner />);

      const promptEvent = new Event(
        "beforeinstallprompt"
      ) as BeforeInstallPromptEvent;
      promptEvent.prompt = jest.fn().mockResolvedValue(undefined);
      promptEvent.userChoice = Promise.resolve({ outcome: "dismissed" });

      act(() => {
        window.dispatchEvent(promptEvent);
      });

      expect(await screen.findByText(/Add to Home Screen/)).toBeInTheDocument();
    });
  });
});
