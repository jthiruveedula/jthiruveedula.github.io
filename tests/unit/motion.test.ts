import { EASE, DUR, STAGGER, prefersReducedMotion, isCoarsePointer } from "@/lib/motion";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

describe("lib/motion constants", () => {
  it("EASE has the expected shape", () => {
    expect(EASE).toMatchObject({
      cinematic: expect.any(String),
      soft: expect.any(String),
      snap: expect.any(String),
      glide: expect.any(String),
      settle: expect.any(String),
    });
  });

  it("DUR has the expected shape", () => {
    expect(DUR).toMatchObject({
      micro: expect.any(Number),
      base: expect.any(Number),
      hero: expect.any(Number),
      pin: expect.any(Number),
      ambient: expect.any(Number),
    });
  });

  it("STAGGER has the expected shape", () => {
    expect(STAGGER).toMatchObject({
      tight: expect.any(Number),
      cards: expect.any(Number),
      slow: expect.any(Number),
    });
  });
});

describe("prefersReducedMotion", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns true when the media query matches", () => {
    mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it("returns false when the media query does not match", () => {
    mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("isCoarsePointer", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns true when the media query matches", () => {
    mockMatchMedia(true);
    expect(isCoarsePointer()).toBe(true);
  });

  it("returns false when the media query does not match", () => {
    mockMatchMedia(false);
    expect(isCoarsePointer()).toBe(false);
  });
});
