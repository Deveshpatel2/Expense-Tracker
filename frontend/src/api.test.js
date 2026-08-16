import { apiFetch, listExpenses, createExpense, deleteExpense, API_BASE_URL } from './api';

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  const mockJson = (body, ok = true, status = 200) =>
    global.fetch.mockResolvedValue({ ok, status, json: async () => body });

  it('sends the stored token as a Bearer header', async () => {
    localStorage.setItem('token', 'abc123');
    mockJson({ success: true, data: [] });

    await listExpenses();

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer abc123');
  });

  it('omits the Authorization header when there is no token', async () => {
    mockJson({ success: true, data: [] });

    await listExpenses();

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('builds the URL from the API base', async () => {
    mockJson({ success: true, data: [] });

    await listExpenses();

    expect(global.fetch.mock.calls[0][0]).toBe(`${API_BASE_URL}/expenses`);
  });

  it('returns the parsed body on success', async () => {
    mockJson({ success: true, data: [{ id: '1', description: 'Coffee' }] });

    const expenses = await listExpenses();

    expect(expenses).toEqual([{ id: '1', description: 'Coffee' }]);
  });

  it('throws with the server message on a failed request', async () => {
    mockJson({ success: false, message: 'Invalid category' }, false, 400);

    await expect(createExpense({})).rejects.toThrow('Invalid category');
  });

  it('throws a status-based message when the body has none', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      }
    });

    await expect(apiFetch('/expenses')).rejects.toThrow('Request failed (500)');
  });

  it('sends DELETE with the expense id', async () => {
    mockJson({ success: true });

    await deleteExpense('exp-9');

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/expenses/exp-9`);
    expect(options.method).toBe('DELETE');
  });
});
