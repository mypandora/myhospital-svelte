/**
 * API 错误类
 * 对应后端的 IErrorResponse 结构
 */
export class ApiError extends Error {
	/**
	 *
	 * @param {number} status
	 * @param {number} code
	 * @param {string} message
	 * @param {object} [errors]
	 * @param {string | null} [traceId]
	 */
	constructor(status, code, message, errors, traceId) {
		super(message);
		this.name = 'ApiError';
		this.status = status; // HTTP 状态码
		this.code = code; // 业务错误码
		this.message = message; // 错误消息
		this.errors = errors; // 详细错误信息（如验证错误）
		this.traceId = traceId; // 链路追踪 ID

		// 保持堆栈追踪
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ApiError);
		}
	}

	/**
	 * 是否为网络错误（status === 0）
	 */
	isNetworkError() {
		return this.status === 0;
	}

	/**
	 * 是否为客户端错误（4xx）
	 */
	isClientError() {
		return this.status >= 400 && this.status < 500;
	}

	/**
	 * 是否为服务器错误（5xx）
	 */
	isServerError() {
		return this.status >= 500;
	}

	/**
	 * 是否为特定业务错误码
	 * @param {number} code
	 */
	hasCode(code) {
		return this.code === code;
	}

	/**
	 * 是否为认证错误（401）
	 */
	isAuthError() {
		return this.status === 401;
	}

	/**
	 * 是否为验证错误（422）
	 */
	isValidationError() {
		return this.status === 422;
	}

	/**
	 * 获取第一个字段错误消息
	 */
	getFirstFieldError() {
		if (!this.errors || typeof this.errors !== 'object') {
			return null;
		}
		const firstKey = Object.keys(this.errors)[0];
		if (!firstKey) {
			return null;
		}
		const firstError = this.errors[firstKey];
		return Array.isArray(firstError) ? firstError[0] : firstError;
	}
}
