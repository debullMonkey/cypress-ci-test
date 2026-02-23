// ENV1 테스트: http://localhost:4001
const BASE_URL = 'http://localhost:4001'
const EXPECTED_ENV = 'env1'

describe(`[${EXPECTED_ENV}] 기본 기능 테스트`, () => {

  // ── API 직접 테스트 ────────────────────────────────
  describe('API 헬스체크', () => {
    it('GET /api/health 가 정상 응답을 반환한다', () => {
      cy.request(`${BASE_URL}/api/health`).then((res) => {
        expect(res.status).to.eq(500)
        expect(res.body.status).to.eq('error')
      })
    })

    it('GET /api/items 가 상품 목록을 반환한다', () => {
      cy.request(`${BASE_URL}/api/items`).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.be.greaterThan(0)
        // 각 상품에 id, name, price 필드가 있는지 확인
        res.body.forEach((item) => {
          expect(item).to.have.property('id')
          expect(item).to.have.property('name')
          expect(item).to.have.property('price')
        })
      })
    })
  })

  // ── UI 테스트 ─────────────────────────────────────
  describe('페이지 렌더링', () => {
    beforeEach(() => {
      cy.visit(BASE_URL)
    })

    it('페이지 타이틀이 표시된다', () => {
      cy.contains('h1', 'Practice App').should('be.visible')
    })

    it('서버 상태가 ok로 표시된다', () => {
      cy.get('[data-testid="health-status"]', { timeout: 10000 }).should('exist')
      cy.get('[data-testid="status"]').should('have.text', 'ok')
    })

    it(`환경이 ${EXPECTED_ENV}로 표시된다`, () => {
      cy.get('[data-testid="env"]', { timeout: 10000 }).should('have.text', EXPECTED_ENV)
    })

    it('상품 목록이 3개 표시된다', () => {
      cy.get('[data-testid="item-list"]', { timeout: 10000 }).should('exist')
      cy.get('[data-testid="item-list"] li').should('have.length', 3)
    })

    it('노트북 상품이 목록에 있다', () => {
      cy.get('[data-testid="item-list"]', { timeout: 10000 })
        .should('contain.text', '노트북')
    })
  })
})
